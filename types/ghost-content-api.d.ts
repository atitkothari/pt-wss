declare module '@tryghost/content-api' {
    export default class GhostContentAPI {
        constructor(options: {
            url: string;
            key: string;
            version: string;
        });
        
        posts: {
            browse: (options?: any) => Promise<any>;
            read: (options: any, params?: any) => Promise<any>;
        };
    }
} 