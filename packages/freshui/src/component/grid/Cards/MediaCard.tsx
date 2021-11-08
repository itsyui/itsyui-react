import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Card, Button } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { BsThreeDotsVertical } from "react-icons/bs";
import { IMediaCardWidgetProps } from "./cardTypes";

type MediaCardControlProps = IWidgetControlProps & IMediaCardWidgetProps;

function getListItemActions(id: string, actions: any, props: any, executeCommand: any) {
    if (Array.isArray(actions) && actions.length > 0) {
        const { handleMoreBtnClick, anchorEl, handleClose, currentFocusedRow } = props;
        const primaryItem = actions.find(t => t.isPrimary && t.enabled);
        const nonPrimaryActions = actions.filter(t => primaryItem ? (t.name !== primaryItem.name && t.enabled) : t.enabled);
        const primaryAction = primaryItem && (primaryItem.iconPosition == "none"
			? <Button color="secondary" variant="outline-primary" size="sm" className=""
				onClick={(e) => executeCommand(primaryItem, id, props, e)}
			>{primaryItem.displayText}</Button >
			: <Button color="secondary" variant="outline-primary" size="sm" className="freshui-btn-control"
				onClick={(e) => executeCommand(primaryItem, id, props, e)}
			>
				{primaryItem.iconPosition === "startIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
				{primaryItem.displayText}
				{primaryItem.iconPosition === "endIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
			</Button >);
        return (
            <div className="model-actions">
                {primaryAction}
                {nonPrimaryActions && nonPrimaryActions.length > 0 &&
                    <div className="customize-table-action" onClick={handleMoreBtnClick.bind(this, id)}>
                        <Dropdown>
                            <Dropdown.Toggle>
                                <BsThreeDotsVertical />
                            </Dropdown.Toggle>
                            {anchorEl && currentFocusedRow === id &&
                                <Dropdown.Menu show={Boolean(anchorEl)} className="super-colors">
                                    {
                                        nonPrimaryActions.map((t, i) => {
                                            return <Dropdown.Item key={`${id}-${i}`} data-id={id} onClick={(e) => executeCommand(t, id, props, e)}>{t.displayText}</Dropdown.Item>;
                                        })
                                    }
                                </Dropdown.Menu>
                            }
                        </Dropdown>
                    </div>
                }
            </div>);
    }
    return null;
}

const MediaCard = props => {

	const { cardId, cardViewProps, onCardSelect, mediaSrc, primaryValue, secondaryValue, tertiaryValue, renderCell, actions, executeCommand } = props;
	const actionItems = getListItemActions(cardId, actions, cardViewProps, executeCommand);
	return (
		<Card className="freshui-media-card-container" onClick={(event) => onCardSelect(event, cardId, { ...cardViewProps })}>
			{mediaSrc && mediaSrc ?
				<Card.Img
					src={mediaSrc}
					title={primaryValue && primaryValue["value"] ? primaryValue["value"] : null}
				/> : null
			}
			<Card.Body>
				{primaryValue &&
					<Card.Title className="media-card-title">
						{renderCell(primaryValue["column"], primaryValue["value"], 0, { ...props })}
					</Card.Title>}
				{secondaryValue &&
					<Card.Text className="media-card-secondary">
						{renderCell(secondaryValue["column"], secondaryValue["value"], 0, { ...props })}
					</Card.Text>
				}
			</Card.Body>
			{Array.isArray(actions) && actions.length > 0 &&
                <div className="card-action">
                    {actionItems}
                </div>
            }
		</Card>
	);
};

class MediaCardControl extends React.Component<MediaCardControlProps, {}> {

	_getControlSchemaProperties = (props) => {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(props.schema, definitions);
		return schema;
	}

	render() {
		const { cardId, cardViewProps, onCardSelect, mediaSrc, primaryValue, secondaryValue
			, tertiaryValue, renderCell, actions, executeCommand } = this._getControlSchemaProperties(this.props);
		return (
			<MediaCard
				cardId={cardId}
				cardViewProps={cardViewProps}
				mediaSrc={mediaSrc}
				primaryValue={primaryValue}
				secondaryValue={secondaryValue}
				tertiaryValue={tertiaryValue}
				actions={actions}
				renderCell={renderCell}
				onCardSelect={onCardSelect}
				executeCommand={executeCommand}
				{...this.props}
			/>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const MediaCardControlC = withReducer("MediaCardControl", mapDispatchToProps)(MediaCardControl);
MediaCardControlC["displayName"] = "MediaCardControl";

WidgetsFactory.instance.registerFactory(MediaCardControlC);
WidgetsFactory.instance.registerControls({
	media_card_control: "MediaCardControl",
	"itsy:ui:mediacard": "MediaCardControl",
});
