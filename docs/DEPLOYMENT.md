# Getting Started with My-App

This guide will walk you through setting up and running "My-App" locally, including Firebase and Tailwind CSS configurations.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Git

## Setup Guide

Follow these steps to get "My-App" up and running:

### Step 1: Install Firebase Tools

Install the Firebase CLI globally on your system. This allows you to interact with Firebase services from your terminal.

```bash
npm install -g firebase-tools
```

### Step 2: Create Your React + TypeScript Project with Vite

Use Vite to scaffold a new React project with TypeScript. Navigate into the new project directory and install the necessary dependencies.

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### Step 3: Configure Tailwind CSS

Integrate Tailwind CSS into your project by removing the default `App.css` and updating `index.css` to import Tailwind's base, components, and utilities styles.

1.  Remove `src/App.css`:
    ```bash
    rm src/App.css
    ```
2.  Update `src/index.css` to include Tailwind directives:
    ```css
    /* src/index.css */
    @import 'tailwindcss';
    ```

### Step 4: Configure Vite for Tailwind CSS

Modify your `vite.config.ts` to include the Tailwind CSS plugin for Vite.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Step 5: Update `package.json` Dependencies

Ensure you install the correct dependencies for Tailwind CSS and Firebase:

```bash
npm install firebase @tailwindcss/vite
npm install -D tailwindcss
```

### Step 6: Initialize Firebase Project

Log in to Firebase and initialize your project. During initialization, select "Firestore" and "Hosting" as features.

1.  Log in to Firebase:
    ```bash
    firebase login
    ```
2.  Initialize your Firebase project:

    ```bash
    rm -rf .firebase .firebaserc
    cp .env.example .env.test
    firebase init
    ```

    When prompted, select the following features:
    - `Firestore`: To set up security rules and indexes.
    - `Hosting`: For web app deployments.

    Follow the prompts to connect to an existing Firebase project or create a new one.

3.  On error `firebaserules had HTTP Error: 403, The caller does not have permission.`:
    1.  Go to Project https://console.firebase.google.com/u/0/
    2.  Add web app -> Register App
    3.  Get `firebaseConfig` data and fill in to `.env.test`
    4.  Repeat `firebase init` but use existing project
    5.  What do you want to use as your public directory? **dist**

4.  Verify that created Web App
    1.  Go to Project https://console.firebase.google.com/u/0/ -> Click on created project
    2.  Add web app -> Register App
    3.  Get `firebaseConfig` data and fill in to `.env.test`
    4.  Run `source .env.test`
    5.  Run again `firebase init` and choose existing project

### Step 7: Configure Hosting Public Directory

When setting up Firebase Hosting, ensure you specify `dist` as your public directory instead of the default `public`. This aligns with Vite's build output.

- **Configure as a single-page app (rewrite all urls to /index.html)?** - No

### Step 8: Set Up Firestore Database and Rules

1.  Go to the [Firestore Console](https://console.firebase.google.com/project/_/firestore) and create a new Firestore database if you haven't already.
2.  Copy the provided `firestore.rules` content into your local `firestore.rules` file in the project root. The content should look like this (for development purposes, allowing read/write access):

    ```
    rules_version = '2';

    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: true;
        }
      }
    }
    ```

    **Note:** This rule grants full public read/write access. **Do not use this in production.** For production, implement proper authentication and authorization rules.

    _If you encounter "Missing or insufficient permissions" errors after setting up your rules, you might need to grant the `firebaserules.admin` role to your user. Replace `myemail@domain.com` with your Firebase-associated email._

    ```bash
    source .env.test
    ```

    ```bash
    source .env.test
    gcloud projects add-iam-policy-binding ${VITE_FIREBASE_PROJECT_ID} \
      --member="user:myemail@domain.com" \
      --role="roles/firebaserules.admin"
    ```

### Step 9: Add Firebase Project Aliases (Optional)

If you have different environments (e.g., test and production), you can add aliases to easily switch between them.

```bash
firebase use --add
```

Follow the prompts to add aliases for your Firebase projects.

### Step 10: Test Locally

Finally, run your application locally using Vite's development server. If you have different Firebase environments configured (e.g., `test`), you can specify the mode.

```bash
npm run dev -- --mode test
```

This will start the development server, and you can access your application in your web browser, interacting with your configured Firebase project.

### Step 11: Deploy to Test and Production Environments

To deploy your application to your Firebase projects (test and production), use the following commands:

1.  **Deploy to Test:**
    ```bash
    npm run build
    firebase deploy --only hosting --project ${VITE_FIREBASE_PROJECT_ID}
    ```
2.  **Deploy to Production:**
    ```bash
    firebase deploy --only hosting --project <YOUR_PROD_PROJECT_ID>
    ```
    _Replace `<YOUR_TEST_PROJECT_ID>` and `<YOUR_PROD_PROJECT_ID>` with your actual Firebase project IDs for test and production respectively._

Alternatively, if you have set up aliases using `firebase use --add` (as in Step 9), you can deploy using the alias:

1.  **Deploy to Test (using alias):**
    ```bash
    firebase deploy --only hosting --alias test
    ```
    Or using npm script:
    ```bash
    npm run deploy:test
    ```
2.  **Deploy to Production (using alias):**
    ```bash
    firebase deploy --only hosting --alias prod
    ```
    Or using npm script:
    ```bash
    npm run deploy:prod
    ```

### Step 12: Configure Firebase Authentication and Firestore Security Rules for User Data

This application uses both anonymous and Google authentication to manage user-specific ideas. To ensure proper data isolation and access, you need to configure your Firebase project as follows:

1.  **Enable Google Cloud Billing**:
    Firebase Authentication (especially for Google Sign-in) and advanced Firestore features might require a billing account. Ensure billing is enabled for your Google Cloud Project linked to Firebase.
    - Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing)

2.  **Enable Identity Platform**:
    The Identity Platform is crucial for managing various authentication providers.
    - Go to [Identity Platform API Library](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com) and enable the API.

3.  **Enable Authentication Providers**:
    You need to enable Anonymous and Google Sign-in methods in your **Firebase project**.
    - Go to [Firebase Authentication](https://console.firebase.google.com/project/_/authentication/users)
    - Navigate to the **"Sign-in method"** tab.
    - Enable **"Anonymous"** provider.
    - Enable **"Google"** provider. Follow the prompts to configure it (e.g., setting a support email and public-facing name).

4.  **Update Firestore Security Rules**:
    The application stores user-specific data under `artifacts/{appId}/users/{userId}/nodes`. To ensure users can only access their own data, you must update your `firestore.rules` file:

    ```firestore.rules
    rules_version = '2';
    service cloud.firestore {
    match /databases/{database}/documents {
        // Allow read/write to 'artifacts/{appId}/users/{userId}/nodes'
        // only if the request's auth.uid matches the {userId} in the path.
        // This ensures a user can only access their own data.
        match /artifacts/{appId}/users/{userId}/nodes/{nodeId} {
        allow read, write: if request.auth.uid == userId;
        }

        // Allow unauthenticated reads for general 'artifacts/{appId}/public/data'
        // if you have any public data that doesn't require user authentication.
        // (This rule might be removed if all data is user-specific)
        match /artifacts/{appId}/public/data/{document=**} {
        allow read: if true; // Adjust as per your public data requirements
        allow write: if false; // Public writes should generally be restricted
        }

        // You might need a rule for creating the initial user document if it's not done via functions
        // For example, to allow a new user to create their first node document if it doesn't exist.
        // This requires careful consideration for production environments.
        // For this application, as userId is either device ID or actual UID,
        // and data is written directly, the `request.auth.uid == userId` should handle it.
    }
    }
    ```

    **Note**: The rule `allow read, write: if request.auth.uid == userId;` ensures that only the authenticated user (identified by `request.auth.uid`, which will be the Firebase `uid` for Google users, or the anonymous `uid` for anonymous users) can read and write data in their specific path. **It's crucial to understand that if an anonymous user signs in and then logs in with Google, their `uid` will change, and they will access a different set of ideas.**

    _After updating `firestore.rules`, deploy them using:_

    ```bash
    firebase deploy --only firestore:rules
    ```

### Step 13: Remove All Project Data

To remove all data associated with your Firebase project, including Firestore documents, Storage files, and the project itself, follow these steps:

1.  **Delete Firestore Collection Data:**
    To delete an entire collection (e.g., `items`), you can use the Firebase CLI:

    ```bash
    firebase firestore:delete --all-collections --project <YOUR_PROJECT_ID>
    ```

    _Replace `<YOUR_PROJECT_ID>` with your actual Firebase project ID._

2.  **Delete Storage Files (Optional):**
    If you have uploaded files to Firebase Storage, you can delete them from the Firebase Console.

3.  **Delete Firebase Project:**
    To completely delete your Firebase project, go to the [Firebase Console](https://console.firebase.google.com/) > Project settings > "Delete project".
    _Be extremely cautious as this action is irreversible and will delete all data and resources associated with the project._
