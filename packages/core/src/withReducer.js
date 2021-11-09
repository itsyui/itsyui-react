import React, { Component } from "react";
import { actionCreator, transitionDispatcher, createSelector, extend, createDispatcher } from './fnutils';
import { LayoutManagerContext } from './LayoutManager';
import { StateManagerContext } from "./CustomStateManager";
import { Machine } from "xstate";
import widgetsFactory from './widgetsFactory';

const withReducer = (key, reducer, mapDispatchToProps, stateJSON) => WrappedComponent => {
	function createFilteredReducer(reducerFunction, reducerPredicate) {
		return (state, action) => {
			const isInitializationCall = state === undefined || Object.keys(state).length === 0;
			if (isInitializationCall) {
				return reducerFunction(state, action !== undefined ? action : {});
			}
			const shouldRunWrappedReducer = reducerPredicate(action);
			// Use this to check the flow of rendering
			// console.log(`key: ${key}; action: ${action.type}; this.controlID: ${action.controlID}; shouldRunWrappedReducer:${shouldRunWrappedReducer}`);
			return shouldRunWrappedReducer ? reducerFunction(state, action) : state;
		};
	}

	class Extended extends Component {
		constructor(props, context) {
			super(props, context);
			this._globalState = {};
			this.componentMounted = false;
			this.dispatcher = createDispatcher();
			this.controlID = props.schema && props.schema.controlID ? props.schema.controlID : Math.floor(Math.random() * 100000) + 1;
			// console.log(`Control Init:: key: ${key}; this.controlID: ${this.controlID};`);
			if (mapDispatchToProps) {
				this.mapDispatchToPropsFn = mapDispatchToProps((action) => actionCreator(this.dispatcher, () => this._globalState, (e) => this._onTxDispatch(e), this.controlID)(action));
			}

			if (stateJSON) {
				let customStateMachineProps = null;
				const dataLoader = widgetsFactory.instance.services["DataLoaderFactory"];
				if (dataLoader !== undefined && dataLoader !== null) {
					const customStateProvider = dataLoader.getLoader("customStateProvider");
					if (customStateProvider !== undefined && customStateProvider !== null) {
						const contextPath = props.contextPath !== undefined && props.contextPath !== null ? props.contextPath : {};
						customStateMachineProps = customStateProvider.getCustomStateMachine(key, contextPath);
					}
				}

				let stateJSONFinal = stateJSON;
				if (customStateMachineProps !== null && customStateMachineProps.length > 0) {
					customStateMachineProps.forEach((sm) => {
						stateJSONFinal = extend(stateJSONFinal, sm.stateJSON);
						if (sm.mapDispatchToAction) {
							const smFnDispatch = sm.mapDispatchToAction((action) => actionCreator(this.dispatcher, () => this._globalState, (e) => this._onTxDispatch(e), this.controlID)(action));
							this.customMapDispatchToPropsFn = {
								...this.customMapDispatchToPropsFn,
								...smFnDispatch
							};
						}
					});
				}

				this.stateMachine = new Machine(stateJSONFinal);
				this.currentTransitionState = this.stateMachine.initialState.value;
			}

			this.transitionPropsFn = {
				transition: (event) => this._onTxDispatch(event),
				getTransitionState: () => this.currentTransitionState,
				getControlID: () => this.controlID,
			};

			this.selector = createSelector(this.dispatcher, createFilteredReducer(reducer, (action) => action.controlID === this.controlID));
			this.initSubscribers();
		}

		_onTxDispatch(event) {
			if (!event.controlID) {
				event.controlID = this.controlID;
			}

			event.key = key;
			transitionDispatcher.onNext(event);
		}

		transition(event) {
			if (!this.stateMachine) {
				return;
			}

			const stateNode = this.stateMachine.getStateNode(this.currentTransitionState);
			if (stateNode === undefined || stateNode === null) {
				return;
			}

			const peekStateCandidate = stateNode.on[event.type];
			if (peekStateCandidate === undefined || peekStateCandidate !== null && peekStateCandidate.length === 0) {
				return;
			}

			const hasChangedState = this.currentTransitionState !== peekStateCandidate[0].target[0];
			const isSameControlKey = key === event.key;
			const isSameControlID = this.controlID === event.controlID;
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

			// update the atomic state (yes, there's better ways of doing this)
			const nextState = this.stateMachine
				.transition(this.currentTransitionState, event.type);

			this.currentTransitionState = nextState.value;

			if (nextState.actions && nextState.actions.length > 0) {
				const actionToInvoke = this.mapDispatchToPropsFn[nextState.actions[0].type];
				if (actionToInvoke && actionToInvoke !== undefined) {
					// `dispatch` is passed into the action
					// in case the action emits other events
					actionToInvoke(event);
				}

				if (this.customMapDispatchToPropsFn) {
					const customActionsToInvoke = nextState.actions.map(fn => this.customMapDispatchToPropsFn[fn] && this.customMapDispatchToPropsFn[fn.type]);
					if (customActionsToInvoke !== undefined && customActionsToInvoke !== null && customActionsToInvoke.length > 0) {
						customActionsToInvoke.forEach((action) => {
							if (action !== undefined) {
								action(event);
							}
						});
					}
				}
			}
		}

		initSubscribers() {
			this.subscription = this.selector.subscribe(t => {
				if (this.componentMounted) {
					this._globalState = t;
					this.setState(t);
				} else {
					this.state = t;
				}
			});
			this.transitionSubscription = transitionDispatcher.subscribe(t => {
				if (this.componentMounted) {
					this.transition(t);
				} else {
					// error case
				}
			});
		}

		componentWillMount() {
			if (!this.componentMounted) {
				this.componentMounted = true;
				this.dispatcher.onNext({}, {});
			}
		}

		componentWillUnmount() {
			this.subscription.dispose();
			this.transitionSubscription.dispose();
			this._globalState = null;
		}

		render() {
			const state = this.state != null ? this.state : undefined;
			return <WrappedComponent {...state} {...this.props} {...this.mapDispatchToPropsFn} {...this.transitionPropsFn} />;
		}
	}

	const contextConsumer = (WrappedComponentExt) => {
		class ContextWidget extends Component {
			render() {
				return (
					<LayoutManagerContext.Consumer>
						{t => (
							<StateManagerContext.Consumer>
								{s => (
									<WrappedComponentExt {...this.props} contextPath={s !== undefined ? s.contextPath !== undefined ? s.contextPath : null : null} dispatcher={t.dispatcher} />
								)}
							</StateManagerContext.Consumer>
						)}
					</LayoutManagerContext.Consumer>
				);
			}
		}

		return ContextWidget;
	};

	return contextConsumer(Extended);
};

export default withReducer;