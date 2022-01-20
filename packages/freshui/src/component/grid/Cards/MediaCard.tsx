import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Card, Button } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { BsThreeDotsVertical } from "react-icons/bs";
import { IMediaCardWidgetProps } from "./cardTypes";

type MediaCardControlProps = IWidgetControlProps & IMediaCardWidgetProps;

function keyHandler(action: any, id: string, props: any, event: any, executeCommand: any) {
	if (event.keyCode === 13 || event.keyCode === 32) {
		executeCommand(action, id, props, event)
	}
}

function KeyCardHandler(event: any, id: string, cardprops: any, onCardSelect: any) {
	if (event.keyCode === 13 || event.keyCode === 32) {
		onCardSelect(event, id, cardprops)
	}
}

function getListItemActions(id: string, actions: any, props: any, executeCommand: any) {
    if (Array.isArray(actions) && actions.length > 0) {
        const { handleMoreBtnClick, anchorEl, handleClose, currentFocusedRow,keyMoreHandler} = props;
        const primaryItem = actions.find(t => t.isPrimary && t.enabled);
        const nonPrimaryActions = actions.filter(t => primaryItem ? (t.name !== primaryItem.name && t.enabled) : t.enabled);
        const primaryAction = primaryItem && (primaryItem.iconPosition == "none"
			? <Button color="secondary" variant="outline-primary" size="sm" className=""
				onClick={(e) => executeCommand(primaryItem, id, props, e)} onKeyDown={(e) => keyHandler(primaryItem, id, props, e, executeCommand)} tabIndex={0} aria-label={primaryItem.displayText}
			>{primaryItem.displayText}</Button >
			: <Button color="secondary" variant="outline-primary" size="sm" className="freshui-btn-control"
				onClick={(e) => executeCommand(primaryItem, id, props, e)} onKeyDown={(e) => keyHandler(primaryItem, id, props, e, executeCommand)} tabIndex={0} aria-label={primaryItem.displayText}
			>
				{primaryItem.iconPosition === "startIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
				{primaryItem.displayText}
				{primaryItem.iconPosition === "endIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
			</Button >);
        return (
            <div className="model-actions">
                {primaryAction}
                {nonPrimaryActions && nonPrimaryActions.length > 0 &&
                    <div className="customize-table-action" onClick={handleMoreBtnClick.bind(this, id)} tabIndex={0} onKeyUp={keyMoreHandler.bind(this, id)} >
                        <Dropdown tabIndex={0}>
                            <Dropdown.Toggle>
                                <BsThreeDotsVertical />
                            </Dropdown.Toggle>
                            {anchorEl && currentFocusedRow === id &&
                                <Dropdown.Menu show={Boolean(anchorEl)} className="super-colors">
                                    {
                                        nonPrimaryActions.map((t, i) => {
                                            return <Dropdown.Item key={`${id}-${i}`} data-id={id} onClick={(e) => executeCommand(t, id, props, e)}  onKeyDown={(e) => keyHandler(t, id, props, e, executeCommand)} tabIndex={0}>{t.displayText}</Dropdown.Item>;
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
		<Card className="freshui-media-card-container" onClick={(event) => onCardSelect(event, cardId, { ...cardViewProps })} onKeyDown={(event) => KeyCardHandler(event, cardId, { ...cardViewProps }, onCardSelect)} tabIndex={0}>
			{mediaSrc && mediaSrc ?
				<Card.Img
					tabIndex={0}
					src={mediaSrc}
					title={primaryValue && primaryValue["value"] ? primaryValue["value"] : null}
				/> : null
			}
			<Card.Body>
				{primaryValue &&
					<Card.Title className="media-card-title" tabIndex={0}>
						{renderCell(primaryValue["column"], primaryValue["value"], 0, { ...props })}
					</Card.Title>}
				{secondaryValue &&
					<Card.Text className="media-card-secondary" tabIndex={0}>
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
