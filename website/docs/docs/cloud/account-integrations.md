---
title: "Account integrations in dbt Cloud"
sidebar_label: "Account integrations" 
description: "Learn how to configure account integrations for your dbt Cloud account."
---

The following sections describe the different **Account integrations** available from your dbt Cloud account under the account **Settings** section.

<Lightbox src="/img/docs/dbt-cloud/account-integrations.jpg" title="Example of Account integrations from the sidebar" /> 

## Git

Connect your dbt Cloud account to your Git provider to enable dbt Cloud users to authenticate your personal accounts. dbt Cloud will perform Git actions on behalf of your authenticated self, against repositories to which you have access according to your Git provider permissions.

To configure a Git account integration:
1. Navigate to Account settings in the side menu.
2. Under the **Settings** section, click on **Integrations**.
3. Click on the Git provider from the list and select the **Pencil** icon to the right of the provider.
4. dbt Cloud [natively connects](/docs/cloud/git/git-configuration-in-dbt-cloud) to the following Git providers:

   - GitHub
   - GitLab
   - Azure DevOps <Lifecycle status="enterprise" />

You can connect your dbt Cloud account to additional Git providers by importing a git repository from any valid git URL. Refer to [Import a git repository](/docs/cloud/git/import-a-project-by-git-url) for more information.

<Lightbox src="/img/docs/dbt-cloud/account-integration-git.jpg" width="85%" title="Example of the Git integration page" />

## OAuth

Connect your dbt Cloud account to an OAuth provider that are integrated with dbt Cloud. 

To configure an OAuth account integration:
1. Navigate to Account settings in the side menu.
2. Under the **Settings** section, click on **Integrations**.
3. Under **OAuth**, and click on **Link** to connect your Slack account.
4. For custom OAuth providers, under **Custom OAuth integrations**, click on **Add integration** and select the OAuth provider from the list. Fill in the required fields and click **Save**.

<Lightbox src="/img/docs/dbt-cloud/account-integration-oauth.jpg" width="85%" title="Example of the OAuth integration page" />

## AI

Once AI features have been [enabled](/docs/cloud/enable-dbt-copilot#enable-dbt-copilot), you can use dbt Labs' AI integration or bring-your-own provider to support AI-powered dbt Cloud features like [dbt Copilot](/docs/cloud/dbt-copilot) and [Ask dbt](/docs/cloud-integrations/snowflake-native-app). Note, if you bring-your-own provider, you will incur API calls and associated charges for features used in dbt Cloud.

To configure the AI integration in your dbt Cloud account, a dbt Cloud admin can perform the following steps:
1. Navigate to **Account settings** in the side menu.
2. Under the **Settings** section, click on **Integrations**.
3. Scroll to **AI**.
4. Click on the **Pencil** icon to the right of **OpenAI** to configure the AI integration.

<Lightbox src="/img/docs/dbt-cloud/account-integration-ai.jpg" width="85%" title="Example of the AI integration page" />

### dbt Labs OpenAI

1. Select the toggle for **dbt Labs** to use dbt Labs' managed OpenAI key.
2. Click **Save**.

### OpenAI key
1. Select the toggle for **OpenAI** to use your own OpenAI key.
2. Enter the API key.
3. Click **Save**.

### Azure OpenAI <Lifecycle status="beta" />

**Deploying your own OpenAI model on Azure** https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-openai

:::info
dbt Cloud's AI is optimized for OpenAIs gpt-4o. Using other models can negatively affect performance and accuracy.
(We cannot guarantee things will be working as expected for any other model)
:::

You can configure credentials for your Azure OpenAI deployment in the following two ways:

- <Expandable alt_header="From a Target URI">

    **Locate your Azure OpenAI deployment URI**
    ref to Azure docs

    ADD SCREENSHOT

    1. Select **Azure OpenAI**.
    2. Select the tab **From Target URI**.
    3. Paste the URI into the **Target URI** field.
    4. Verify the **Endpoint**, **Model Name**, and **API Version** are correct.
    5. Enter your Azure OpenAI API key.
    6. Click **Save**.
  </Expandable>

- <Expandable alt_header="Manually providing the credentials">

    **Locate your Azure OpenAI configuration**
    ref to Azure docs

    ADD SCREENSHOT

    1. Select **Azure OpenAI**.
    2. Select the tab **Manual Input**.
    3. Enter the **Endpoint**.
    4. Enter the **Model Name**.
    5. Enter the **API Version**.
    6. Enter your Azure OpenAI API key.
    7. Click **Save**.
  </Expandable>


