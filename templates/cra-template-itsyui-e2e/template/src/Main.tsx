import {
    Switch,
    useHistory,
    Route,
    Redirect
} from "react-router-dom";
import { useEffect } from "react";
import { useTransition, WidgetsFactory, DataLoaderFactory, IAppSchemaProvider } from "@itsy-ui/core";
import { ItsyProvider, ItsyPage } from "@itsy-ui/app";
import { Layout } from "./components";

/**
 * Define the application state JSON. It defines the following state,
 * INITIALIZE - Called when the app is loaded for the first time
 * NAVIGATE_URL - Navigates to a URL using the history
 * USER_AUTHENTICATED - Maintain authentication state and user profile authentication
 */
const stateJSON = {
    "initial": "onLoaded",
    "states": {
        "onLoaded": {
            "on": {
                "INITIALIZE": "init",
                "NAVIGATE_URL": "navigateUrl",
                "USER_AUTHENTICATED": "userAuthenticate"
            },
        },
        "init": {
            "onEntry": [
                "onInit",
            ],
            "on": {
                "INITIALIZE_DONE": "onLoaded",
            },
        },
        "navigateUrl": {
            "onEntry": [
                "onNavigateUrl",
            ],
            "on": {
                "NAVIGATION_DONE": "onLoaded",
            },
        },
        "userAuthenticate": {
            "onEntry": [
                "onAuthenticate",
            ],
            "on": {
                "AUTH_COMPLETE": "onLoaded",
            },
        }
    },
};

// Define constants to access the states
const Actions = {
    State: {
        NAVIGATE_URL: "NAVIGATE_URL",
        NAVIGATION_DONE: "NAVIGATION_DONE",
        INITIALIZE_DONE: "INITIALIZE_DONE",
        INITIALIZE: "INITIALIZE",
        USER_AUTHENTICATE: "USER_AUTHENTICATE",
        AUTH_COMPLETE: "AUTH_COMPLETE"
    },
    INIT: "Actions.INIT",
    AUTHENTICATE: "Actions.AUTHENTICATE"
};

// Reducer state to maintain in application state
const initialState = {
    history: null,
    isAuthenticated: false
};

/**
 * Function that maintains reducer state
 * @param state - application state in the reducer, this is an immutable state.
 * @param action - dispatcher action that triggers from action methods.
 * @returns 
 */
function reducer(state, action) {
    switch (action.type) {
        case Actions.INIT:
            return {
                history: action.history,
                isAuthenticated: action.isAuthenticated
            }
        case Actions.AUTHENTICATE:
            return {
                ...state,
                isAuthenticated: action.isAuthenticated
            }
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

/**
 * This action method initializes the application state and registers all the command.
 * It also uses a simple way to verify if user is authenticated and navigates to the route accordingly.
 * @param event - Event object for the INIT transition
 * @returns void
 */
function doInit(event: any) {
    return async (_, dispatch, transition) => {
        const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
        const commandLoader: any = dataLoader.getLoader("commandLoader");
        const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");

        const customCommand = await schemaProvider.getSchema(`/app/command/data`);
        // initialize all commands
        commandLoader.generateCommand(customCommand);
        const isAuthenticated = sessionStorage.getItem("user") !== null;
        dispatch({
            type: Actions.INIT,
            history: event.history,
            isAuthenticated: isAuthenticated
        });
        transition({
            type: Actions.State.INITIALIZE_DONE,
        });
        if (!isAuthenticated) {
            transition({
                type: Actions.State.NAVIGATE_URL,
                url: `/login`,
                history: event.history
            });
        }
    };
}

/**
 * This action method implements the navigation routing using transition API.
 * In the below code, it navigates to LOGIN page,
 * 
 * transition({
 *  type: "NAVIGATE_URL",
 *  url: "/login"
 * });
 * @param event - Event object with URL to navigate to. Only during the INIT phase the history object
 * is passed in the event.
 * @returns void
 */
function doNavigateUrl(event) {
    return (getState, dispatch, transition) => {
        let { history } = getState();
        if (event.history) {
            history = event.history;
        }
        history.push(event.url);
        transition({
            type: Actions.State.NAVIGATION_DONE,
        });
    };
}

/**
 * This action method checks for authentication and navigates accordingly.
 * @param event - Provides the state if the user is authenticated
 * @returns void
 */
function doAuthenticate(event) {
    return (getState, dispatch, transition) => {
        dispatch({
            type: Actions.AUTHENTICATE,
            isAuthenticated: event.isAuthenticated
        });
        transition({
            type: Actions.State.AUTH_COMPLETE,
        });
        if (event.isAuthenticated) {
            transition({
                type: Actions.State.NAVIGATE_URL,
                url: `/home`
            });
        } else {
            transition({
                type: Actions.State.NAVIGATE_URL,
                url: `/login`
            });
        }
    };
}

/**
 * MapDispatchToProps is a set of functions that are bound to the State JSON transition events.
 * This method is also available thru props.
 * @param dispatch - Dispatcher object that triggers the action methods
 * @returns Object
 */
const mapDispatchToProps = (dispatch) => {
    return {
        onNavigateUrl: (event) => dispatch(doNavigateUrl(event)),
        onInit: (event) => dispatch(doInit(event)),
        onAuthenticate: (event) => dispatch(doAuthenticate(event))
    };
};

const PublicRoutes = () => {
    return (
        <div className="container w-50 h-100 d-flex align-items-center">
            <Switch>
                <Route exact path="/login" render={() => <ItsyPage key="login" schema={{
                    pageId: "login"
                }} />} />
                <Route exact path="/" render={() => <Redirect to="/login" />} />
            </Switch>
        </div>
    );
};

const PrivateRoutes = () => {
    return <Layout>
        <Switch>
            <Route exact path="/home" render={() => <ItsyPage key="page1" schema={{
                pageId: "home"
            }} />} />
            <Route exact path="/second" render={() => <ItsyPage key="page2" schema={{
                pageId: "second"
            }} />} />
            <Route exact path="/" render={() => <Redirect to="/home" />} />
        </Switch>
    </Layout>;
};

export const Main: React.FC = (props: any) => {
    const history = useHistory();
    const [state, transition]: any[] = useTransition("Main", reducer, mapDispatchToProps, stateJSON);
    useEffect(() => {
        transition({
            type: Actions.State.INITIALIZE,
            history
        });
    }, []);
    return (
        <ItsyProvider>
            {!state.isAuthenticated ? <PublicRoutes /> : <PrivateRoutes />}
        </ItsyProvider>
    );
};
