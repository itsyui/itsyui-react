import { WidgetsFactory, ICustomStateMachineProvider, ICustomStateMachineData, DataLoaderFactory } from "@itsy-ui/core";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");

/**
 * Handles the form submit override for Login page.
 * @param event - Login event generated from the Login form.
 * @returns void
 */
function doLoginFormSubmit(event: any) {
    return async (getState: any, dispatch: any, transition: any) => {
        try {
            //Handle authorization
            const userInfo = event.values;
            sessionStorage.setItem("user", JSON.stringify(userInfo));

            transition({
                type: "FORM_AFTER_SUBMIT",
            });
            transition({
                type: "USER_AUTHENTICATED",
                isAuthenticated: true,
            });
        } catch (e) {
            console.error(e);
        }
    };
}

const loginFormOnSubmit: ICustomStateMachineData = {
    name: "loginFormOnSubmit",
    stateJSON: {
        "states": {
            "formSubmit": {
                "onEntry": [
                    "onFormSubmit"
                ],
                "on": {
                    "FORM_AFTER_SUBMIT": "formAfterSubmit",
                    "FORM_ERROR": "formError"
                }
            }
        },
    },
    mapDispatchToAction: (dispatch) => {
        return {
            onFormSubmit: (evt) => dispatch(doLoginFormSubmit(evt)),
        };
    },
};
customStateProvider.registerCustomStateMachine("FormWidget", {
    typeId: "login",
    formSchemaId: "login",
    pageId: "login"
}, loginFormOnSubmit);
