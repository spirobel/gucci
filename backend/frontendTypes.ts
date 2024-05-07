import type { MaybeLoggedin } from "./backend";

export type Loggedin = NonNullable<typeof MaybeLoggedin.$Data.loggedin>;
