// swaggerDef.js
module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'ბლოგის API',
    version: '1.0.0',
    description: 'მარტივი ბლოგის API მომხმარებლის ავთენტიფიკაციით, პოსტების მართვით და სურათების ატვირთვით.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'დეველოპმენტის სერვერი',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      UserRegister: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: {
            type: 'string',
            example: 'ჯონ დოე',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
        },
      },
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
        },
      },
      UserUpdate: {
        type: 'object',
        properties: {
          fullName: {
            type: 'string',
            example: 'ჯონათან დოე',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'johnathan.doe@example.com',
          },
          avatar: {
            type: 'string',
            format: 'binary',
            description: 'ატვირთეთ ახალი ავატარის სურათის ფაილი.',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '60d5ec49f1c7d8b2e8f7c9e0',
          },
          fullName: {
            type: 'string',
            example: 'ჯონ დოე',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          avatar: {
            type: 'string',
            format: 'url',
            nullable: true,
            example: 'https://res.cloudinary.com/your_cloud_name/image/upload/v12345/blog-app-uploads/profile-pic-123.png',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      PostCreate: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: {
            type: 'string',
            example: 'ჩემი პირველი ბლოგის პოსტი',
          },
          content: {
            type: 'string',
            example: 'ეს არის ჩემი პირველი ბლოგის პოსტის შინაარსი.',
          },
          coverImage: {
            type: 'string',
            format: 'binary',
            description: 'ატვირთეთ ახალი ქავერ სურათი პოსტისთვის.',
          },
        },
      },
      PostUpdate: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: 'განახლებული ბლოგის პოსტის სათაური',
          },
          content: {
            type: 'string',
            example: 'ეს არის ჩემი ბლოგის პოსტის განახლებული შინაარსი.',
          },
          coverImage: {
            type: 'string',
            format: 'binary',
            description: 'ატვირთეთ ახალი ქავერ სურათი პოსტისთვის.',
          },
        },
      },
      PostReaction: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            enum: ['like', 'dislike'],
            example: 'like',
          },
        },
      },
      CommentCreate: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            example: 'ეს შესანიშნავი პოსტია!',
          },
        },
      },
      CommentUpdate: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            example: 'ეს განახლებული კომენტარია.',
          },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '60d5ec49f1c7d8b2e8f7c9e1',
          },
          text: {
            type: 'string',
            example: 'ეს შესანიშნავი პოსტია!',
          },
          author: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              fullName: { type: 'string' },
              email: { type: 'string' },
              avatar: { type: 'string', nullable: true },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ReactionCount: {
        type: 'object',
        properties: {
          likes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          dislikes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      Post: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '60d5ec49f1c7d8b2e8f7c9e2',
          },
          title: {
            type: 'string',
            example: 'ჩემი პირველი ბლოგის პოსტი',
          },
          content: {
            type: 'string',
            example: 'ეს არის ჩემი პირველი ბლოგის პოსტის შინაარსი.',
          },
          author: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              fullName: { type: 'string' },
              email: { type: 'string' },
              avatar: { type: 'string', nullable: true },
            },
          },
          coverImage: {
            type: 'string',
            format: 'url',
            nullable: true,
            example: 'https://res.cloudinary.com/your_cloud_name/image/upload/v12345/blog-app-uploads/post-cover-123.png',
          },
          reactions: {
            $ref: '#/components/schemas/ReactionCount',
          },
          comments: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Comment',
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  paths: {
    '/auth/sign-up': { // Changed from /auth/register
      post: {
        tags: ['ავთენტიფიკაცია'],
        summary: 'ახალი მომხმარებლის რეგისტრაცია',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserRegister',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'მომხმარებელი წარმატებით დარეგისტრირდა',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    userId: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'არასწორი მოთხოვნა ან მომხმარებელი უკვე არსებობს',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/auth/sign-in': { // Changed from /auth/login
      post: {
        tags: ['ავთენტიფიკაცია'],
        summary: 'მომხმარებლის შესვლა და JWT ტოკენის მიღება',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserLogin',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'წარმატებით შეხვედით სისტემაში',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    userId: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'არასწორი მონაცემები',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/users': {
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['მომხმარებლები'],
        summary: 'ყველა მომხმარებლის მიღება',
        responses: {
          '200': {
            description: 'მომხმარებლების სია',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
      put: {
        security: [{ bearerAuth: [] }],
        tags: ['მომხმარებლები'],
        summary: 'ავთენტიფიცირებული მომხმარებლის პროფილის განახლება (ელფოსტა, სრული სახელი, ავატარი)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/UserUpdate',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'მომხმარებელი წარმატებით განახლდა',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '404': {
            description: 'მომხმარებელი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['მომხმარებლები'],
        summary: 'კონკრეტული მომხმარებლის მიღება ID-ის მიხედვით',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'მომხმარებლის ID',
          },
        ],
        responses: {
          '200': {
            description: 'მომხმარებლის დეტალები',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: 'არასწორი ID',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '404': {
            description: 'მომხმარებელი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
      delete: {
        security: [{ bearerAuth: [] }],
        tags: ['მომხმარებლები'],
        summary: 'მომხმარებლის წაშლა (ადმინისტრატორის ან საკუთარი თავის წაშლა)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'მომხმარებლის ID, რომელიც უნდა წაიშალოს',
          },
        ],
        responses: {
          '200': {
            description: 'მომხმარებელი და მისი პოსტები წარმატებით წაიშალა.',
          },
          '400': {
            description: 'არასწორი ID',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '403': {
            description: 'არ გაქვთ ნებართვა',
          },
          '404': {
            description: 'მომხმარებელი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/posts': {
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები'],
        summary: 'ყველა პოსტის მიღება',
        responses: {
          '200': {
            description: 'პოსტების სია',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Post',
                  },
                },
              },
            },
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
      post: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები'],
        summary: 'ახალი პოსტის შექმნა სურვილისამებრ ქავერ სურათით',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/PostCreate',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'პოსტი წარმატებით შეიქმნა',
          },
          '400': {
            description: 'არასწორი მოთხოვნა (შინაარსი ან სათაური აკლია)',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/posts/{id}': {
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები'],
        summary: 'კონკრეტული პოსტის მიღება ID-ის მიხედვით',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID',
          },
        ],
        responses: {
          '200': {
            description: 'პოსტის დეტალები',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Post',
                },
              },
            },
          },
          '400': {
            description: 'არასწორი ID',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '404': {
            description: 'პოსტი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
      delete: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები'],
        summary: 'პოსტის წაშლა',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID, რომელიც უნდა წაიშალოს',
          },
        ],
        responses: {
          '200': {
            description: 'პოსტი წარმატებით წაიშალა',
          },
          '400': {
            description: 'არასწორი ID',
          },
          '401': {
            description: 'არავტორიზებული (თქვენ არ ხართ პოსტის ავტორი ან ადმინი)',
          },
          '404': {
            description: 'პოსტი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
      put: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები'],
        summary: 'პოსტის განახლება სურვილისამებრ ქავერ სურათით',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID, რომელიც უნდა განახლდეს',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/PostUpdate',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'პოსტი წარმატებით განახლდა',
          },
          '400': {
            description: 'არასწორი ID',
          },
          '401': {
            description: 'არავტორიზებული (თქვენ არ ხართ პოსტის ავტორი ან ადმინი)',
          },
          '404': {
            description: 'პოსტი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/posts/{id}/reactions': {
      post: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები', 'რეაქციები'],
        summary: 'რეაქციის (like/dislike) დამატება/წაშლა პოსტზე',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PostReaction',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'რეაქცია წარმატებით განახლდა.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    reactions: { $ref: '#/components/schemas/ReactionCount' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'არასწორი მოთხოვნა (არასწორი რეაქციის ტიპი ან ID)',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '404': {
            description: 'პოსტი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/posts/{id}/comments': {
      post: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები', 'კომენტარები'],
        summary: 'კომენტარის დამატება პოსტზე',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CommentCreate',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'კომენტარი წარმატებით დაემატა.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    comment: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'არასწორი მოთხოვნა (კომენტარის ტექსტი აკლია ან არასწორი ID)',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '404': {
            description: 'პოსტი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
    '/posts/{postId}/comments/{commentId}': {
      put: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები', 'კომენტარები'],
        summary: 'კომენტარის განახლება პოსტზე',
        parameters: [
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID',
          },
          {
            name: 'commentId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'კომენტარის ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CommentUpdate',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'კომენტარი წარმატებით განახლდა.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    comment: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'არასწორი მოთხოვნა (კომენტარის ტექსტი აკლია ან არასწორი ID)',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '403': {
            description: 'თქვენ არ გაქვთ ნებართვა ამ კომენტარის განახლებისთვის.',
          },
          '404': {
            description: 'პოსტი ან კომენტარი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
      delete: {
        security: [{ bearerAuth: [] }],
        tags: ['პოსტები', 'კომენტარები'],
        summary: 'კომენტარის წაშლა პოსტიდან',
        parameters: [
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'პოსტის ID',
          },
          {
            name: 'commentId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'კომენტარის ID',
          },
        ],
        responses: {
          '200': {
            description: 'კომენტარი წარმატებით წაიშალა.',
          },
          '400': {
            description: 'არასწორი მოთხოვნა (არასწორი ID)',
          },
          '401': {
            description: 'არავტორიზებული',
          },
          '403': {
            description: 'თქვენ არ გაქვთ ნებართვა ამ კომენტარის წასაშლელად.',
          },
          '404': {
            description: 'პოსტი ან კომენტარი ვერ მოიძებნა',
          },
          '500': {
            description: 'სერვერის შეცდომა',
          },
        },
      },
    },
  },
};
