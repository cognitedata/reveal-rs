export const fdmViewsMockData = [
  {
    space: 'blog',
    externalId: 'Post',
    name: 'Post',
    description: 'Post',
    filter: {},
    implements: [],
    version: '1',
    properties: {
      title: {
        externalId: 'title',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'title',
        description: 'title',
        type: {
          type: 'text',
          list: false,
          collation: 'ucs_basic',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'PostTable',
        },
        containerPropertyExternalId: 'title',
      },
      views: {
        externalId: 'views',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'views',
        description: 'views',
        type: {
          type: 'int32',
          list: false,
          collation: 'ucs_basic',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'PostTable',
        },
        containerPropertyExternalId: 'views',
      },
      tags: {
        externalId: 'tags',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'tags',
        description: 'tags',
        type: {
          type: 'text',
          list: true,
          collation: 'ucs_basic',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'PostTable',
        },
        containerPropertyExternalId: 'tags',
      },
      user: {
        externalId: 'tags',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'tags',
        description: 'tags',
        type: {
          type: 'edge',
          externalId: 'Post_User_Edge',
          name: 'user',
          direction: 'outwards',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'PostTable',
        },
        containerPropertyExternalId: 'user',
      },
      comments: {
        type: 'edge',
        externalId: 'Post_Comments_Edge',
        name: 'comments',
        direction: 'outwards',
      },
    },
    usedBy: [],
    datamodelId: 'blog',
  },
  {
    space: 'blog',
    externalId: 'User',
    name: 'User',
    description: 'User',
    filter: {},
    implements: [],
    version: '1',
    properties: {
      name: {
        externalId: 'name',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'name',
        description: 'name',
        type: {
          type: 'text',
          list: false,
          collation: 'ucs_basic',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'UserTable',
        },
        containerPropertyExternalId: 'name',
      },
    },
    usedBy: [],
  },
  {
    space: 'blog',
    externalId: 'Comment',
    name: 'Comment',
    description: 'Comment',
    filter: {},
    implements: [],
    version: '1',
    properties: {
      body: {
        externalId: 'body',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'body',
        description: 'body',
        type: {
          type: 'text',
          list: false,
          collation: 'ucs_basic',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'CommentTable',
        },
        containerPropertyExternalId: 'name',
      },
      date: {
        externalId: 'date',
        nullable: true,
        autoIncrement: false,
        defaultValue: '',
        name: 'date',
        description: 'date',
        type: {
          type: 'timestamp',
          list: false,
          collation: 'ucs_basic',
        },
        container: {
          type: 'container',
          space: 'blog',
          externalId: 'CommentTable',
        },
        containerPropertyExternalId: 'date',
      },
      post: {
        type: 'edge',
        externalId: 'Post_Comments_Edge',
        name: 'post',
        direction: 'inwards',
      },
    },
    usedBy: [],
  },
];
