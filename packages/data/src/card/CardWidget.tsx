import { getDefaultRegistry, getLocaleString, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
// import { ICardWidgetDispatchProps, ICardWidgetStateProps, ICardWidgetStateTransitionProps } from "../layout/types/cardWidget";
import { CardActions, doCardCollapse, doCardExpand, doCardInit, doCardLoad, doCardRefresh, onNavigateTo } from "./actions";
import reducer from "./reducer";

import stateJSON from "./state.json";

// type CardWidgetProps = ICardWidgetStateProps & ICardWidgetDispatchProps & ICardWidgetStateTransitionProps;

class CardWidget extends React.Component<any, {}> {

	componentWillMount() {
		const { title, secondaryTitle, cardType, items, titleAlign, pageContext } = this.getControlSchemaProperties();
		if (this.props.transition) {
			this.props.transition({
				type: CardActions.State.CARD_ON_INIT,
				data: { title, secondaryTitle, cardType, items, titleAlign },
				pageContext
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		const { title, secondaryTitle, cardType, items, titleAlign } = nextProps.schema;
		if (this.props.transition) {
			this.props.transition({
				type: CardActions.State.CARD_REFRESH,
				data: { title, secondaryTitle, cardType, items, titleAlign }
			});
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_handleNavigateTo = (data) => {
		this.props.navigateTo(data);
	}

	generateLocaleString(data: any) {
		return data.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		});
	}

	handleExpandAndCollapse() {
		const { isExpand } = this.props;
		if (isExpand) {
			this.props.transition({
				type: CardActions.State.CARD_COLLAPSE
			});
		} else {
			this.props.transition({
				type: CardActions.State.CARD_EXPAND
			});
		}

	}

	_getCardUIControlSchema() {
		const cardUIControlSchema = {
			name: `card-ui-control`,
			properties: {
				"ui:widget": "card_control",
				data: this.props.data,
				isExpand: this.props.isExpand,
				handleExpandAndCollapse: this.handleExpandAndCollapse.bind(this),
				className: this.props.className,
				style: this.props.style
			},
		};

		return <SchemaContainer key="1" schema={cardUIControlSchema} />;
	}

	render() {
		if (this.props.data) {
			return this._getCardUIControlSchema();
		} else {
			return <label>No data</label>;
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onCardInit: (event) => dispatch(doCardInit(event)),
		onCardLoad: (event) => dispatch(doCardLoad(event)),
		onCardRefresh: (event) => dispatch(doCardRefresh(event)),
		navigateTo: (data) => dispatch(onNavigateTo(data)),
		onCardExpand: (event) => dispatch(doCardExpand(event)),
		onCardCollapse: (event) => dispatch(doCardCollapse(event))
	};
};

const CardWidgetC = withReducer("CardWidget", reducer, mapDispatchToProps, stateJSON)(CardWidget);
CardWidgetC.displayName = "CardWidget";

WidgetsFactory.instance.registerFactory(CardWidgetC);
WidgetsFactory.instance.registerControls({
	card: "CardWidget",
	'itsy:card': "CardWidget"
});

export default CardWidgetC;
