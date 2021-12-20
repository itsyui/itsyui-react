import * as React from 'react';
import { WidgetsFactory, getDefaultRegistry, retrieveSchema } from '@itsy-ui/core';

export class DynamicCardWidget extends React.Component<any> {
    _getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    onRowSelect(id) {
        const { onRowSelect } = this._getControlSchemaProperties();
        if (onRowSelect) {
            onRowSelect(id);
        }
    }

    getSelectedRows(selectedRecordId, styles) {
        const { fieldSchema } = this.props.schema;
        const selectedRows = fieldSchema && fieldSchema.selectedRows ? fieldSchema.selectedRows : null;
        if (Array.isArray(selectedRows) && selectedRows.length > 0) {
            let obj = selectedRows.find(
                s => {
                    if (s["objectId"])
                        return s["objectId"] === selectedRecordId;
                    else if (s["id"])
                        return s["id"] === selectedRecordId;
                    else
                        return s["cmis:objectId"] === selectedRecordId;
                });
            if (obj != undefined) {
                return styles && styles.selectedColor ? styles.selectedColor : "dynamicCard-selected"
            }
			return "dynamicCard-non-selected";
        } else {
            return "root-card-container-main dynamicCard-non-selected";
        }
    }

    renderCard(layout, widgets, styles) {
        const { onRenderCardActions, onRenderCardAttributes, record, className, style } = this._getControlSchemaProperties();
        const id = record["cmis:objectId"] ? record["cmis:objectId"] : record["id"] ? record["id"] : record["objectId"];
        if (layout && layout.rows) {
            let classNames = styles ? styles.className : "";
            classNames = className ? `${classNames} ${className}` : classNames;
            const customStyle = style ? style : {};
            return <div className={`root-card-container ${classNames}`} style={customStyle} tabIndex={0}>
                {<div className={this.getSelectedRows(id, styles)} tabIndex={0} key="card-attributes" onClick={this.onRowSelect.bind(this, id)}>
                    {onRenderCardAttributes(layout.rows, widgets)}
                </div>}
                <div className="card-btn-align" key="card-actions" tabIndex={0}>{onRenderCardActions()}</div>
            </div>
        }
    }

    render() {
        const { layout, widgets, styles } = this._getControlSchemaProperties();
        return <>
            {this.renderCard(layout, widgets, styles)}
        </>
    }
}

DynamicCardWidget["displayName"] = 'DynamicCardUIWidget';

WidgetsFactory.instance.registerFactory(DynamicCardWidget);
WidgetsFactory.instance.registerControls({
    "itsy:ui:dynamiccard": "DynamicCardUIWidget"
});
