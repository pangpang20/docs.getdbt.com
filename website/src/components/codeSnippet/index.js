import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import CodeBlock from '@theme/CodeBlock';

// Define metric types with corresponding $ref paths for type_params
const metricTypes = {
    simple: '#/$defs/simple_metric_type_params',
    ratio: '#/$defs/ratio_metric_type_params',
    cumulative: '#/$defs/cumulative_metric_type_params',
    derived: '#/$defs/derived_metric_type_params',
    conversion: '#/$defs/conversion_metric_type_params',
  };
  
  function CodeSnippet({ resourceType, metricType, overrides = {} }) {
    const [yamlConfig, setYamlConfig] = useState('');
  
    useEffect(() => {
      async function fetchData() {
        try {
          const response = await fetch(
            'https://raw.githubusercontent.com/dbt-labs/dbt-jsonschema/main/schemas/latest/dbt_yml_files-latest.json'
          );
          const jsonData = await response.json();
  
          let resourceSchema = jsonData.properties[resourceType];
          if (!resourceSchema) {
            setYamlConfig(`Resource type "${resourceType}" not found.`);
            return;
          }
  
          // Resolve the definitions
          const definitions = jsonData['$defs'] || jsonData.definitions || {};
  
          // Generate example configuration with metricType handling
          const exampleConfig = generateExampleConfig(resourceSchema, definitions, '', overrides, metricType);
  
          // Convert to YAML
          const yamlString = yaml.dump({ [resourceType]: exampleConfig });
  
          setYamlConfig(yamlString);
        } catch (error) {
          console.error('Error fetching data:', error);
          setYamlConfig(`Error fetching data: ${error.message}`);
        }
      }
      fetchData();
    }, [resourceType, metricType, overrides]);
  
    function generateExampleConfig(schema, definitions, propertyName = '', overrides = {}, metricType) {
      schema = resolveSchema(schema, definitions);
  
      if (schema.anyOf) {
        return generateExampleConfig(schema.anyOf[0], definitions, propertyName, overrides, metricType);
      }
      if (schema.oneOf) {
        return generateExampleConfig(schema.oneOf[0], definitions, propertyName, overrides, metricType);
      }
      if (schema.allOf) {
        const mergedSchema = schema.allOf.reduce((acc, curr) => {
          return { ...acc, ...resolveSchema(curr, definitions) };
        }, {});
        return generateExampleConfig(mergedSchema, definitions, propertyName, overrides, metricType);
      }

      // Set the 'type' property dynamically based on metricType for metrics resource
      if (propertyName === 'type' && metricType && resourceType === 'metrics') {
        return metricType.toUpperCase();
      }
  
      // Handle type_params for specific metricType if resourceType is 'metrics'
      if (propertyName === 'type_params' && metricType && resourceType === 'metrics') {
        const typeRef = metricTypes[metricType.toLowerCase()];
        if (typeRef) {
          schema = resolveRef(typeRef, definitions);
        }
      }
  
      // Check if there is an override for this propertyName
      if (overrides && Object.prototype.hasOwnProperty.call(overrides, propertyName)) {
        const overrideValue = overrides[propertyName];
        if (typeof overrideValue === 'object' && overrideValue.newName) {
          const { newName, value } = overrideValue;
          return value || newName;
        } else {
          return overrideValue;
        }
      }
  
      if (schema.type === 'array') {
        if (schema.items) {
          return [generateExampleConfig(schema.items, definitions, propertyName, overrides, metricType)];
        } else {
          return ['array'];
        }
      } else if (schema.type === 'object') {
        const obj = {};
        const properties = schema.properties || {};
  
        if (Object.keys(properties).length === 0 && schema.additionalProperties !== true) {
          return 'dictionary';
        }
  
        for (const [key, value] of Object.entries(properties)) {
          const resolvedValue = resolveSchema(value, definitions);
  
          if (overrides[key] && typeof overrides[key] === 'object' && overrides[key].newName) {
            const { newName, value: overrideValue } = overrides[key];
            obj[newName] = overrideValue || generateExampleConfig(resolvedValue, definitions, newName, overrides, metricType);
          } else {
            obj[key] = generateExampleConfig(resolvedValue, definitions, key, overrides, metricType);
          }
        }
  
        if (schema.additionalProperties === true) {
          obj['additional_property'] = 'example_value';
        }
  
        return obj;
      } else if (schema.enum) {
        return schema.enum[0];
      } else if (schema.type === 'string') {
        return 'string';
      } else if (schema.type === 'number' || schema.type === 'integer') {
        return 'integer';
      } else if (schema.type === 'boolean') {
        return 'boolean';
      } else {
        return 'null';
      }
    }

    function resolveRef(ref, definitions) {
        const refPath = ref.replace('#/', '').split('/');
        let schemaPart = definitions;
        for (const part of refPath) {
          if (part === '$defs') continue;  // Skip '$defs'
          if (schemaPart[part]) {
            schemaPart = schemaPart[part];
          } else {
            return null;  // Return null to avoid further errors if the part is missing
          }
        }
        return schemaPart;
      }
      
    
    function resolveSchema(schema, rootSchema) {
        if (schema.$ref) {
          const ref = schema.$ref;
          const refPath = ref.replace('#/', '').split('/');
          let resolvedSchema = rootSchema;
          for (const part of refPath) {
            if (part === '') continue; // Skip empty strings
            if (resolvedSchema[part] !== undefined) {
              resolvedSchema = resolvedSchema[part];
            } else {
              console.error(`Could not resolve part '${part}' in path '${ref}'`);
              return {};
            }
          }
          return resolveSchema(resolvedSchema, rootSchema);
        } else {
          return schema;
        }
      }
  
    return (
      <div>
        <CodeBlock language="yaml">{yamlConfig}</CodeBlock>
      </div>
    );
  }
  
  export default CodeSnippet;
  