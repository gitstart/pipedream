import github from "../../github.app.mjs";

export default {
    key: "github-create-pull-request",
    name: "Create Pull request",
    description: "Create a new pull request in a Github repo. [See docs here](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#create-a-pull-request)",
    version: "0.0.7",
    type: "action",
    props: {
        github,
        repoFullname: {
            propDefinition: [
              github,
              "repoFullname",
            ],
        },
        base: {
          label: "Base",
          description: "The name of the branch you want the changes pulled into. This should be an existing branch on the current repository",
          type: "string",
          propDefinition: [
              github,
              "branch",
              (branch) => ({
                repoFullname: branch.repoFullname,
              }),
          ],
        },
        head: {
          label: "Head",
          description: "The name of the branch where your changes are implemented. For cross-repository pull requests in the same network, namespace head with a user like this; username:branch.",
          type: "string",
          propDefinition: [
            github,
            "branch",
            (branch) => ({
              repoFullname: branch.repoFullname,
            }),
        ],
        },
        title: {
            label: "Title",
            description: "The title of the pull request",
            type: "string",
        },
        issueNumber: {
            label: "Issue Number",
            description: "An issue in the repository to convert to a pull request.",
            type: "integer",
            optional: true,
            propDefinition: [
              github,
              "issueNumber",
              (c) => ({
                repoFullname: c.repoFullname,
              }),
            ],
        },
        body: {
            label: "Body",
            description: "The contents of the pull request",
            type: "string",
            optional: true,
        },
        maintainer_can_modify: {
            label: 'Maintainer can modify',
            description: "Indicates whether maintainers can modify the pull request.",
            type: "boolean",
            optional: true,
        },
        draft: {
            label: 'Draft PR',
            description: "Indicates whether the pull request is a draft. ",
            type: "boolean",
            optional: true,
        },
    },
    async run({ $ }) {
        if (this.base && this.head) {
          this.base = this.base.split("/")[1];
          this.head = this.head.split("/")[1];
        } else {
          const branches = await this.github.getBranches({
            repoFullname: this.repoFullname,
          });
    
          const [masterBranch] = branches.filter((branch) => branch.name === "master" || branch.name === "main");
    
          if (masterBranch) {
            this.base = masterBranch.name
            this.head = masterBranch.name
          };
        }

        const response = await this.github.createPullRequest({
            repoFullname: this.repoFullname,
            data: {
              title: this.title,
              body: this.body,
              base: this.base,
              head: this.head,
              issue: this.issue,
              draft: this.draft,
              maintainer_can_modify: this.maintainer_can_modify
            },
          });
      
          $.export("$summary", "Successfully created pull request.");
      
          return response;
    }
}