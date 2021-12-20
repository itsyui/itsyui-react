import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer, StateManagerContext } from "@itsy-ui/core";
import React, { Component } from "react";
import { Accordion, Badge, Card, Container, Row, Col, Button } from "react-bootstrap";

class FilterControl extends Component {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	renderChips = (chips) => {
		const { onRemoveFilter } = this._getControlSchemaProperties();
		if (chips && Object.keys(chips).length > 0) {
			const badges = [];
			Object.keys(chips).forEach((cKey, index) => {
				if (chips[cKey].value) {
					const badgeLabel = chips[cKey] ? `${chips[cKey].displayName} - ${chips[cKey].value}` : cKey;
					badges.push(
						<Badge
							pill
							variant="primary"
							className="filter-chip"
							label={badgeLabel}
							tabIndex={0}
							ariaLabel={badgeLabel}
							key={`filter-badge-${index}`}
						>
							{badgeLabel}
							<i className="freshui-icons" onClick={(event) => onRemoveFilter(event, cKey)} tabIndex={0} aria-label="cancel">cancel</i>
						</Badge>
					);
				}
			});
			return badges;
		}
	}

	renderForm = () => {
		const { formSchema, filterContextPath, applyFilterOnChange, controlID } = this._getControlSchemaProperties();
		const filterbarFormSchema = {
			name: "filterbar-form",
			properties: {
				"ui:widget": "form",
				typeId: controlID,
				formSchema,
				controlID: `${controlID}`,
				submitButtonText: "Apply",
				...applyFilterOnChange && { showSubmitButton: false },
			},
		};
		return <StateManagerContext.Provider key="filterbar-form-state-provider" value={{ contextPath: filterContextPath }}>
			<SchemaContainer key="filterbar-form" schema={filterbarFormSchema} />
		</StateManagerContext.Provider>;
	}

	renderHeader = (chips, onResetFilters) => {
		return (<Container>
			<Row lg={2} md={2} sm={2} xl={2} xs={2}>
				<Col lg={10} md={10} sm={10} xl={10} xs={10} className="col-filter-chips" tabIndex={0}>
					{this.renderChips(chips)}
				</Col>
				<Col lg={2} md={2} sm={2} xl={2} xs={2} className="filter-clear-btn">
					<Button variant="link" size="sm" onClick={onResetFilters} tabIndex={0} aria-label="clear">Clear</Button>
				</Col>
			</Row>
		</Container>);
	}

	renderExpanded = (chips, onResetFilters) => {
		return <Card className="filter-expanded">
			<Card.Header>
				{this.renderHeader(chips, onResetFilters)}
			</Card.Header>
			<Card.Body>
				{this.renderForm()}
			</Card.Body>
		</Card>
	}

	renderCollapsed = (chips, onResetFilters) => {
		return <Accordion className="filter-expanded" ><Card>
			<Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
				{this.renderHeader(chips, onResetFilters)}
			</Accordion.Toggle>
			<Accordion.Collapse eventKey="0">
				<Card.Body>
					{this.renderForm()}
				</Card.Body>
			</Accordion.Collapse>
		</Card>
		</Accordion>
	}

	renderFilterbarUI = () => {
		const { onResetFilters, chips, isExpanded } = this._getControlSchemaProperties();
		const filterbar = isExpanded === true ? this.renderExpanded(chips, onResetFilters) : this.renderCollapsed(chips, onResetFilters);
		return <Container>
			{filterbar}
		</Container>
	}

	render() {
		return this.renderFilterbarUI();
	}
}

const mapDispatchToProps = () => {
	return {};
};

const filterControl = withReducer("FilterControl", mapDispatchToProps)(FilterControl);
filterControl.displayName = "FilterControl";

WidgetsFactory.instance.registerFactory(filterControl);
WidgetsFactory.instance.registerControls({
	filterbarControl: "FilterControl",
});