import { Machine, interpret, assign } from "xstate";
import cuid from "cuid";

import "./LoginForm.css";

import { createElement as h } from "../../lib";

interface FormContext {
  username: string | null;
  password: string | null;
}

interface FormStates {
  states: {
    idle: {};
  };
}

interface UsernameSetEvent {
  type: "USERNAME_SET";
  value: string;
}

interface PasswordSetEvent {
  type: "PASSWORD_SET";
  value: string;
}

type FormEvent = { type: "SUBMIT" } | UsernameSetEvent | PasswordSetEvent;

export let Form = () => {
  let usernameId = `Input-${cuid()}`;
  let passwordId = `Input-${cuid()}`;

  let formMachine = Machine<FormContext, FormStates, FormEvent>(
    {
      id: "form",
      initial: "idle",
      context: {
        username: null,
        password: null
      },
      states: {
        idle: {
          on: {
            USERNAME_SET: {
              actions: ["setUsername", "setUsernameOnDOM"]
            },
            PASSWORD_SET: {
              actions: ["setPassword", "setPasswordOnDOM"]
            },
            SUBMIT: {
              actions: ["deleteValues", "deleteValuesFromDOM"]
            }
          }
        }
      }
    },
    {
      actions: {
        setUsername: assign<FormContext, FormEvent>({
          username: (_, e) => (e as UsernameSetEvent).value
        }),
        setUsernameOnDOM: (_, e) => {
          let { value } = e as UsernameSetEvent;

          $(`#${usernameId}`).val(value);
        },
        setPassword: assign<FormContext, FormEvent>({
          password: (_, e) => (e as PasswordSetEvent).value
        }),
        setPasswordOnDOM: (_, e) => {
          let { value } = e as PasswordSetEvent;

          $(`#${passwordId}`).val(value);
        },
        deleteValues: assign<FormContext, FormEvent>({
          username: null,
          password: null
        }),
        deleteValuesFromDOM: () => {
          $(`#${usernameId}`).val("");
          $(`#${passwordId}`).val("");
        }
      }
    }
  );

  let service = interpret(formMachine).start();

  let { username, password } = service.state.context;

  return h("form", {
    attrs: {
      id: "form",
      onsubmit: (e: Event) => {
        e.preventDefault();
      }
    },
    children: [
      h("h2", {
        children: ["Sign In"]
      }),

      h("div", {
        children: [
          h("label", {
            attrs: {
              for: usernameId
            },
            children: ["Username:"]
          }),

          h("input", {
            attrs: {
              id: usernameId,
              autocomplete: "username",
              value: username || "",
              oninput: (e: Event) => {
                service.send({
                  type: "USERNAME_SET",
                  value: e.target.value
                });
              }
            }
          })
        ]
      }),

      h("div", {
        children: [
          h("label", {
            attrs: {
              for: passwordId
            },
            children: ["Password:"]
          }),

          h("input", {
            attrs: {
              id: passwordId,
              type: "password",
              autocomplete: "current-password",
              value: password || "",
              oninput: (e: Event) => {
                service.send({
                  type: "PASSWORD_SET",
                  value: e.target.value
                });
              }
            }
          })
        ]
      }),

      h("button", {
        attrs: {
          onclick: (e: MouseEvent) => {
            e.preventDefault();

            service.send({ type: "SUBMIT" });
          }
        },
        children: ["Submit"]
      })
    ]
  });
};
