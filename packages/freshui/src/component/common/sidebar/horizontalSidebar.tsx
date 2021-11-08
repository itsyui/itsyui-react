import { getDefaultRegistry, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getBasePath } from "../../../utils/helper";
import Nav from 'react-bootstrap/Nav'
import { Dropdown } from 'react-bootstrap';

function getContainsURL(childUrl, pathName, queryParams) {
    if (Array.isArray(childUrl) && pathName) {
        return childUrl.some(item => {
            const isPathURL = pathName.endsWith(item); // if pathName match return true, otherwise will check with pathName and queryParams
            return !isPathURL && queryParams ? `${pathName}${queryParams}`.endsWith(item) : isPathURL;
        });
    }
    return false;
}

const HorizontalSidebarComponent = props => {
    const { data, container, layout, className, style } = props;
    const basePath = getBasePath();
    return (
        <div className={className ? `freshui-horizontal-navbar-container ${className}` : "freshui-horizontal-navbar-container"} style={style ? style : {}}>
            <Nav className={layout === "layout_type_c" ? 'freshui-layoutC_header_fixed_design' : "freshui-header_fixed_design"}>
                <div className="freshui-horizontal-navbar-section">
                    <ul className={"freshui-horizontal_ul"}>
                        {data.map(subOption => {
                            if (subOption.appIcon === undefined && !subOption.children) {
                                let containUrl = false;
                                let url = window.location.href;
                                if (subOption.hasOwnProperty("childUrl")) {
                                    const pathName: string = window.location.pathname;
                                    const queryParams = window.location.search;
                                    containUrl = getContainsURL(subOption.childUrl, pathName, queryParams);
                                }
                                let listItemClass = layout === "layout_type_c" ? "horizontalTop-list-item" : "freshui-horizontal-list-item"
                                listItemClass = containUrl ? listItemClass + ' ' + "active" : listItemClass;
                                return (<li className={listItemClass}>
                                    <a href={subOption.url && window.location.origin + basePath + subOption.url} className="sidebar-atag-item">
                                        <div className={layout === "layout_type_c" ? "horizontal_top_icon" : "freshui-horizontal-list-item"}
                                            onClick={props.onSidebarItemClicked.bind(this, subOption)}
                                            key={subOption.title}>
                                            {subOption.image && subOption.image !== "" ? <img src={subOption.image} className="sidebar-imageIcon" /> : subOption.iconName && subOption.iconName !== "" ?
                                                <i className={subOption.className}>{subOption.iconName}</i> : <i className="freshui-icons">blur_circular</i>}
                                            <div className="freshui-horizontal-sidebar-menu-text">
                                                {subOption.title}
                                            </div>
                                        </div>
                                    </a>
                                </li>);
                            } else if (subOption.children && subOption.children.length > 0) {
                                return (<li className={layout === "layout_type_c" ? "horizontalTop-list-item" : "freshui-horizontal-list-item"}>
                                    <a href={subOption.url && window.location.origin + basePath + subOption.url} className="sidebar-atag-item">
                                        <div className={layout === "layout_type_c" ? "horizontal_top_icon" : "freshui-horizontal-list-item"}
                                            onClick={(e) => props.handleClick(e)}
                                            key={subOption.title}>
                                            {subOption.image && subOption.image !== "" ? <img src={subOption.image} className="sidebar-imageIcon" /> : subOption.iconName && subOption.iconName !== "" ?
                                                <i className={subOption.className}>{subOption.iconName}</i> : <i className="freshui-icons">blur_circular</i>}
                                            <div className="freshui-horizontal-sidebar-menu-text">
                                                {subOption.title}
                                            </div>
                                        </div>
                                    </a>
                                </li>);
                            }
                        })
                        }
                    </ul>
                </div>
            </Nav>
            {props.renderChildItem()}
        </div>
    );
};


class HorizontalSidebar extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {
            selectedItems: {},
            anchorEl: null,
        }
    }

    _getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }
    handleClick(e: any) {
        this.setState({
            anchorEl: e.currentTarget,
        });
    }
    handleClose() {
        this.setState({
            anchorEl: null,
        });
    }
    renderChildItem() {
        const { data } = this._getControlSchemaProperties();
        return <Dropdown drop="down" onClick={(e) => this.handleClose()}>
            <Dropdown.Menu show={Boolean(this.state.anchorEl)} className="super-colors">
                {
                    data.map(t => {
                        if (t.children && t.children.length > 0) {
                            t.children.map(subchilder => {
                                <Dropdown.Item key={subchilder.id} onClick={this.onSidebarItemClicked.bind(this, subchilder)} >{subchilder.title}</Dropdown.Item>
                            });
                        }
                    })
                }
            </Dropdown.Menu>
        </Dropdown>;
    }

    onSidebarItemClicked(item: any, e: any) {
        const { keySelected } = this._getControlSchemaProperties();
        let updatedItems = {};
        if (!item["children"] || item.children.length === 0) {
            keySelected(item);
        }
        if (Object.keys(this.state.selectedItems).length === 0) {
            updatedItems = { [item.title]: true }
        } else {
            const foundItem = this.state.selectedItems.hasOwnProperty(item.title);
            updatedItems = foundItem ? { [item.title]: !this.state.selectedItems[item.title] } : item.parentId ?
                { [item.title]: true } : item.children ? item.children.find(t => this.state.selectedItems[t.title]) ? { [item.title]: false } : { [item.title]: true } : { [item.title]: false };
        }
        this.setState({ selectedItems: updatedItems });
        e.preventDefault();
    }

    render() {
        const { data, container, layout, className, style } = this._getControlSchemaProperties();
        return <>
            <HorizontalSidebarComponent
                data={data}
                container={container}
                layout={layout}
                selectedItems={this.state.selectedItems}
                onSidebarItemClicked={this.onSidebarItemClicked.bind(this)}
                renderChildItem={this.renderChildItem.bind(this)}
                handleClick={this.handleClick.bind(this)}
                {...this.props}
                className={className}
                style={style}
            />
        </>
    }

}

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

const sidebarControl = withReducer('HorizontalSidebar', mapDispatchToProps)(HorizontalSidebar);
sidebarControl.displayName = 'HorizontalSidebar';

WidgetsFactory.instance.registerFactory(sidebarControl);
WidgetsFactory.instance.registerControls({
    horizontal_sidebar: "HorizontalSidebar",
    "itsy:ui:horizontalsidebar": "HorizontalSidebar"
});
