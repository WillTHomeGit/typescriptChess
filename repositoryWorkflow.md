### **Team Collaboration Guide (Public Repository Workflow)**

Our project is public on GitHub, which means we'll use the standard "Fork and Pull Request" workflow. This is a powerful and safe way to collaborate.

#### **The Big Picture: Our Workflow**

Because the repository is public, you cannot push code directly to it. Instead, you will work on your own personal copy (a "fork") and then submit your changes back to the main project for review.

1.  You will create a **Fork** of our main repository on GitHub. This gives you a personal server-side copy.
2.  You will **Clone** your fork to your local computer.
3.  You will do all your work on a **Branch** within your local copy.
4.  You will **Push** your branch up to *your fork* on GitHub.
5.  Finally, you will open a **Pull Request** from your fork back to our original project.

---

### **Step 1: Fork the Repository (One-Time Setup)**

1.  Navigate to our project's main repository page on GitHub.
2.  In the top-right corner, click the **"Fork"** button.
3.  GitHub will create a copy of the project under your own account. It will look like `your-username/project-name`.

### **Step 2: Clone Your Fork (One-Time Setup)**

Now, get the code from *your fork* onto your local machine.

1.  On your fork's GitHub page, click the green `<> Code` button and copy the HTTPS URL. **Make sure you are copying the URL from your fork, not the original project.**
2.  In your terminal, run:
    ```sh
    git clone https://github.com/your-username/project-name.git
    ```

### **Step 3: Connect Your Fork to the Main Project (One-Time Setup)**

You need to tell your local copy where the original project is so you can keep it up-to-date. We call the original project the **"Upstream"** repository.

1.  Navigate into your newly cloned project directory:
    ```sh
    cd typescriptChess
    ```
2.  Add a remote for the original project:
    ```sh
    git remote add upstream https://github.com/WillTHomeGit/typescriptChess.git
    ```

---

### **Step 4: The Day-to-Day Workflow (How to Add a Feature)**

Follow these steps **every time** you start a new task.

#### **1. Get the Latest Version from Upstream**

Before you start, sync your local `main` branch with the original project's `main` branch.

```sh
# Make sure you are on the main branch
git checkout main

# Fetch the latest changes from the original project and merge them
git pull upstream main
```

#### **2. Create Your Feature Branch**

Create a new branch for your specific task.

```sh
git checkout -b feature/your-awesome-feature
```

#### **3. Do Your Work**

Write your code, create files, and save your changes.

#### **4. Commit Your Changes**

Commit your work with a clear message.

```sh
git add .
git commit -m "feat: Implement the awesome feature"
```

#### **5. Push Your Branch to *Your Fork***

Push your new branch up to your personal fork on GitHub (the default remote is named `origin`).

```sh
git push origin feature/your-awesome-feature
```

#### **6. Open a Pull Request**

1.  Go to your fork's page on GitHub (`github.com/your-username/project-name`).
2.  You will see a banner prompting you to "Compare & pull request". Click it.
3.  This will take you to the "Open a pull request" screen on the **original** repository.
4.  Ensure the "base repository" is our main project and the "head repository" is your fork.
5.  Write a clear title and description for your changes.
6.  Click **"Create pull request"**.
