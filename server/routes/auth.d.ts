declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string;
            email: string;
            name?: string;
            vendorId?: string;
            role: string;
        };
    }
}
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=auth.d.ts.map