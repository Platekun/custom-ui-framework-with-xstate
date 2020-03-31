import { createElement as h } from "../../lib";

import { Form } from "./LoginForm";

export const LoginSection = h("section", {
  children: [h("h2", { children: "Log In Form Component" }), Form()]
});
