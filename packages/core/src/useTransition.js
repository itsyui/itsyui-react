import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { Machine } from "xstate";
import { actionCreator, createSelector, createFilteredReducer, transitionDispatcher, createDispatcher, extend } from './fnutils';
import { StateManagerContext } from './CustomStateManager';
import widgetsFactory from './widgetsFactory';

const onTxDispatcher = (mapDispatchToPropsFn, stateMachine, currentTransitionState, controlKey, controlID, customMapDispatchToPropsFn) => {
	return (event) => {
		if (event === undefined || (event && event.type === undefined)) {
			return;
		}

		const stateNode = stateMachine.getStateNode(currentTransitionState.current);
		if (stateNode === undefined || stateNode === null) {
			return;
		}

		const peekStateCandidate = stateNode.on[event.type];
		if (peekStateCandidate === undefined || (peekStateCandidate !== null && peekStateCandidate.length === 0)) {
			return;
		}

		const hasChangedState = currentTransitionState.current !== peekStateCandidate[0].target[0];
		const isSameControlKey = controlKey === event.key;
		const isSameControlID = controlID === event.controlID;
		const isStrict = event.strict !== undefined && event.strict ? true : false;

		let canTransition = false;
		if (hasChangedState && isSameControlKey && isSameControlID) {
			// if state has changed and its the same control type (for ex: formwidget is rendered 2 times then the event has to be from the same form 
			// from where it origniated)
			canTransition = true;
		} else if (hasChangedState && !isSameControlKey && !isSameControlID && !isStrict) {
			// if state has changed but control key and ID are diff then it has to go to another control and this is allowed.
			// for ex: Form is raising a transition to appwidget to show modal.
			canTransition = true;
		} else if (hasChangedState && !isSameControlKey && isSameControlID) {
			canTransition = true;
		}

		if (!canTransition) {
			return;
		}

		const nextState = stateMachine
			.transition(currentTransitionState.current, event.type);

		currentTransitionState.current = nextState.value;

		if (nextState.actions && nextState.actions.length > 0) {
			const actionToInvoke = mapDispatchToPropsFn[nextState.actions[0].type];
			if (actionToInvoke && actionToInvoke !== undefined) {
				// `dispatch` is passed into the action
				// in case the action emits other events
				actionToInvoke(event);
			}

			if (customMapDispatchToPropsFn) {
				const customActionsToInvoke = nextState.actions.map(fn => customMapDispatchToPropsFn[fn] && customMapDispatchToPropsFn[fn.type]);
				if (customActionsToInvoke !== undefined && customActionsToInvoke !== null && customActionsToInvoke.length > 0) {
					customActionsToInvoke.forEach((action) => {
						if (action !== undefined) {
							action(event);
						}
					});
				}
			}
		}
	};
};

export function useTransition(controlKey, reducer, mapDispatchToProps, stateJSON) {
	const dataLoader = widgetsFactory.instance.services["DataLoaderFactory"];
	const customStateProvider = dataLoader.getLoader("customStateProvider");
	const [gState, setGlobalState] = useState({});
	const globalState = useRef(gState);
	globalState.current = gState;
	const controlID = useMemo(
		() => Math.floor(Math.random() * 100000) + 1,
		[]
	);
	const onTxDispatch = useCallback(
		(event) => {
			if (!event.controlID) {
				event.controlID = controlID;
			}

			event.key = controlKey;
			transitionDispatcher.onNext(event);
		},
		[controlID, controlKey]);
	const dispatcher = useMemo(
		() => createDispatcher(),
		[]
	);
	const mapDispatchToPropsFn = useMemo(
		() => {
			//for testing: console.log('mapDispatchToPropsFn: ', globalState.current);
			return mapDispatchToProps((action) => actionCreator(dispatcher, () => globalState.current, (e) => onTxDispatch(e), controlID)(action))
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[globalState.current]
	);
	const selector = useMemo(
		() => createSelector(dispatcher, createFilteredReducer(reducer, (action) => action.controlID === controlID)),
		[reducer, dispatcher, controlID]
	);
	const stateMachineContext = useContext(StateManagerContext);
	const customStateOverride = useMemo(
		() => {
			if (customStateProvider === undefined || (customStateProvider !== undefined && customStateProvider === null)) {
				return null;
			}

			const ctxPath = stateMachineContext && stateMachineContext.contextPath !== undefined && stateMachineContext.contextPath !== null ? stateMachineContext.contextPath : {};
			const customStateMachineProps = customStateProvider.getCustomStateMachine(controlKey, ctxPath);
			let customMapDispatchToPropsFn = null;
			let stateJSONFinal = stateJSON;
			if (customStateMachineProps !== null && customStateMachineProps.length > 0) {
				customStateMachineProps.forEach((sm) => {
					stateJSONFinal = extend(stateJSONFinal, sm.stateJSON);
					if (sm.mapDispatchToAction) {
						const smFnDispatch = sm.mapDispatchToAction((action) => actionCreator(dispatcher, () => globalState.current, (e) => onTxDispatch(e), controlID)(action));
						customMapDispatchToPropsFn = {
							...customMapDispatchToPropsFn,
							...smFnDispatch
						};
					}
				});
			}

			return { customMapDispatchToPropsFn, stateJSONFinal };
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[stateMachineContext, globalState.current]
	);
	// merge stateMachine from static and custom overrides available
	const stateJSONExt = customStateOverride.stateJSONFinal ? customStateOverride.stateJSONFinal : stateJSON;
	const stateMachine = useMemo(
		() => new Machine(stateJSONExt),
		[stateJSONExt]
	);
	const currentTransitionState = useRef(stateMachine.initialState.value);
	const transition = onTxDispatcher(mapDispatchToPropsFn, stateMachine, currentTransitionState, controlKey, controlID, customStateOverride.customMapDispatchToPropsFn);
	// componentDidMount and Unmount here;
	useEffect(() => {
		const subscription = selector.subscribe(t => {
			// trigger re-render on state change
			setGlobalState(t);
			//globalState.current = t;
		});
		const transitionSubscription = transitionDispatcher.subscribe(t => {
			// process transition on event notify
			transition(t);
		});
		return () => {
			// unmount behavior
			subscription.dispose();
			transitionSubscription.dispose();
		};
	}, []); //define empty array so useEffect is called only on mount, otherwise it keeps calling

	return [globalState.current, transition, () => currentTransitionState, () => controlID];
}
