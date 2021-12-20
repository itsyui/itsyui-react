import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, Card } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { BsThreeDotsVertical } from "react-icons/bs";
import { IAvatarCardWidgetProps } from "./cardTypes";

type AvatarCardControlProps = IWidgetControlProps & IAvatarCardWidgetProps;

function getListItemActions(id: string, actions: any, props: any, executeCommand: any) {
    if (Array.isArray(actions) && actions.length > 0) {
        const { handleMoreBtnClick, anchorEl, handleClose, currentFocusedRow } = props;
        const primaryItem = actions.find(t => t.isPrimary && t.enabled);
        const nonPrimaryActions = actions.filter(t => primaryItem ? (t.name !== primaryItem.name && t.enabled) : t.enabled);
        const primaryAction = primaryItem && (primaryItem.iconPosition == "none"
			? <Button color="secondary" variant="outline-primary" size="sm" className=""
				onClick={(e) => executeCommand(primaryItem, id, props, e)} tabIndex={0} aria-label={primaryItem.displayText}
			>{primaryItem.displayText}</Button >
			: <Button color="secondary" variant="outline-primary" size="sm" className="freshui-btn-control"
				onClick={(e) => executeCommand(primaryItem, id, props, e)} tabIndex={0} aria-label={primaryItem.displayText}
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

const AvatarCard = props => {
    const { cardId, cardViewProps, onCardSelect, avatarSrc, primaryValue, secondaryValue, tertiaryValue, renderCell, actions, executeCommand } = props;
    const actionItems = getListItemActions(cardId, actions, cardViewProps, executeCommand);
    const isSelected = (id) => {
        const { selectedRows, viewAttributes, rows } = cardViewProps;
        const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(rows[0])[0];
        const selectedObj = selectedRows.find(row => row[primaryFieldId] === id);
        return selectedObj !== undefined;
    };
    const avatarImageSrc = Array.isArray(avatarSrc) && avatarSrc.length > 0 ? avatarSrc[0] : avatarSrc;
    return (
        <Card border={isSelected(cardId) ? "primary" : ""} className="simple-card-root-contain" onClick={(event) => onCardSelect(event, cardId, { ...cardViewProps })} tabIndex={0}>
            {(avatarImageSrc || tertiaryValue) &&
                < div className="image-card-display">
                    <div className="card-header-inner">
                        {avatarImageSrc &&
                            <Card.Img tabIndex={0}
                                className="card-image"
                                src={avatarImageSrc}
                            />
                        }
                    </div>
                    {
                        tertiaryValue && <div color="textSecondary" className="card-date-design">
                            {renderCell(tertiaryValue["column"], tertiaryValue["value"], 0, { ...cardViewProps })}
                        </div>
                    }
                </div>
            }
            <Card.Body>
                <div className={`antd-card-content-design ${!(avatarImageSrc || tertiaryValue) ? "" : ""}`} >

                    {primaryValue &&
                        <Card.Title color="textPrimary" className="" tabIndex={0}>
                            {renderCell(primaryValue["column"], primaryValue["value"], 0, { ...cardViewProps })}
                        </Card.Title>
                    }
                    <div className={"card-text antd-image-card-text"}>
                        {secondaryValue &&
                            <Card.Text className={""} tabIndex={0}>
                                {renderCell(secondaryValue["column"], secondaryValue["value"], 0, { ...cardViewProps })}
                            </Card.Text>
                        }
                    </div>
                </div>
            </Card.Body>
            {Array.isArray(actions) && actions.length > 0 &&
                <div className="card-action">
                    {actionItems}
                </div>
            }
        </Card>
    );
};

class AvatarCardControl extends React.Component<AvatarCardControlProps, {}> {

    _getControlSchemaProperties = (props) => {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(props.schema, definitions);
        return schema;
    }

    render() {
        const { cardId, cardViewProps, onCardSelect, avatarSrc, primaryValue, secondaryValue
            , tertiaryValue, renderCell, actions, executeCommand } = this._getControlSchemaProperties(this.props);
        return (
            <AvatarCard
                cardId={cardId}
                cardViewProps={cardViewProps}
                avatarSrc={avatarSrc}
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

const AvatarCardControlC = withReducer("AvatarCardControl", mapDispatchToProps)(AvatarCardControl);
AvatarCardControlC["displayName"] = "AvatarCardControl";

WidgetsFactory.instance.registerFactory(AvatarCardControlC);
WidgetsFactory.instance.registerControls({
    avatar_card_control: "AvatarCardControl",
    "itsy:ui:avatarcard": "AvatarCardControl",
});
