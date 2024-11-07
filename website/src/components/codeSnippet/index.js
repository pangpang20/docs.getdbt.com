import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import CodeBlock from '@theme/CodeBlock';

function CodeSnippet({ resourceType, metricType}) {
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

        // Generate example configuration
        const exampleConfig = generateExampleConfig(resourceSchema, definitions);

        // Convert to YAML
        const yamlString = yaml.dump({ [resourceType]: exampleConfig });

        setYamlConfig(yamlString);
      } catch (error) {
        console.error('Error fetching data:', error);
        setYamlConfig(`Error fetching data: ${error.message}`);
      }
    }
    fetchData();
  }, [resourceType, metricType]);

  // ... include resolveSchema function here

  function generateExampleConfig(schema, definitions) {
    schema = resolveSchema(schema, definitions);

    if (schema.anyOf) {
      return generateExampleConfig(schema.anyOf[0], definitions);
    }
    if (schema.oneOf) {
      return generateExampleConfig(schema.oneOf[0], definitions);
    }
    if (schema.allOf) {
      const mergedSchema = schema.allOf.reduce((acc, curr) => {
        return { ...acc, ...resolveSchema(curr, definitions) };
      }, {});
      return generateExampleConfig(mergedSchema, definitions);
    }

    if (schema.type === 'array') {
      if (schema.items) {
        return [generateExampleConfig(schema.items, definitions)];
      } else {
        return [];
      }
    } else if (schema.type === 'object') {
      const obj = {};
      const properties = schema.properties || {};

      for (const [key, value] of Object.entries(properties)) {
        const resolvedValue = resolveSchema(value, definitions);
        obj[key] = generateExampleConfig(resolvedValue, definitions);
      }

      if (schema.additionalProperties === true) {
        obj['additional_property'] = 'example_value';
      }

      return obj;
    } else if (schema.enum) {
      return schema.enum[0];
    } else if (schema.type === 'string') {
      return 'example_string';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return 42;
    } else if (schema.type === 'boolean') {
      return true;
    } else {
      return null;
    }
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
      <h2>{resourceType} Configuration</h2>
      <CodeBlock language="yaml">
        {yamlConfig}
      </CodeBlock>
    </div>
  );
}

export default CodeSnippet;
