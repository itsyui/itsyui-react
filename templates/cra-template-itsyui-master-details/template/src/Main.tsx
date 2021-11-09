import {
    Switch,
    useHistory,
    Route
} from "react-router-dom";
import { useTransition } from "@itsy-ui/core";
import { ItsyProvider } from '@itsy-ui/app';
import Home from './pages/Home';
import Details from './pages/Details';
import { useEffect } from "react";

const Actions = {
    State: {
        NAVIGATE_URL: "NAVIGATE_URL",
        NAVIGATION_DONE: "NAVIGATION_DONE",
        INITIALIZE_DONE: "INITIALIZE_DONE",
        INITIALIZE: "INITIALIZE"
    },
    INIT: "Actions.INIT"
};

const initialState = {
    history: null
};

function reducer(state: any, action: any) {
    switch (action.type) {
        case Actions.INIT:
            return {
                ...state,
                history: action.history
            }
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

function doInit(event: any) {
    return (getState: any, dispatch: any, transition: any) => {
        dispatch({
            type: Actions.INIT,
            history: event.history
        });
        transition({
            type: Actions.State.INITIALIZE_DONE,
        });
    };
}

function doNavigateUrl(event: any) {
    return (getState: any, dispatch: any, transition: any) => {
        const { history } = getState();
        history.push(event.url);
        transition({
            type: Actions.State.NAVIGATION_DONE,
        });
    };
}

const stateJSON = {
    "initial": "onLoaded",
    "states": {
        "onLoaded": {
            "on": {
                "INITIALIZE": "init",
                "NAVIGATE_URL": "navigateUrl"
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
        }
    },
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        onNavigateUrl: (event: any) => dispatch(doNavigateUrl(event)),
        onInit: (event: any) => dispatch(doInit(event))
    };
};

export const Main: React.FC = (props: any) => {
    const history = useHistory();
    const [_state, transition]: any[] = useTransition("Main", reducer, mapDispatchToProps, stateJSON);
    useEffect(() => {
        transition({
            type: Actions.State.INITIALIZE,
            history
        });
    }, []);
    return (
        <ItsyProvider>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/details" component={Details} />
            </Switch>
        </ItsyProvider>
    );
};