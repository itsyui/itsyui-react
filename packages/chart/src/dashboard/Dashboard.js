import React, { useState, useEffect } from "react";
import { SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import cubejs from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import { useTransition } from '@itsy-ui/core';
import RGL, { WidthProvider } from 'react-grid-layout';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { CmisJSDataSourceLake } from "@itsy-ui/data";
import { getUrlParamValue, getNewId } from "@itsy-ui/utils";
import { getApiURL } from "./utils";
import { DynamicAppSchemaProvider } from "./DynamicAppSchemaProvider";
import ChartRenderer from "./ChartRenderer";
import DashboardItem from "./DashboardItem";

const ReactGridLayout = WidthProvider(RGL);
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];


const initializeDatasource = async () => {
  const datasource = await CmisJSDataSourceLake.newInstance();
  dataLoader.registerLoader({
    datasource: datasource,
  });
  return datasource;
}

const DashboardPageActions = {
  State: {
    ADD_CHART: "ADD_CHART",
    REMOVE_CHART: "REMOVE_CHART",
    ON_LOADED: "ON_LOADED",
    SAVE_DASHBOARD: "SAVE_DASHBOARD",
    LAYOUT_CHANGE: "LAYOUT_CHANGE",
    DASHBOARD_INIT: "DASHBOARD_INIT"
  }
};

const stateJSON = {
  "initial": "onLoaded",
  "states": {
    "onLoaded": {
      "on": {
        "ADD_CHART": "addChart",
        "REMOVE_CHART": "removeChart",
        "SAVE_DASHBOARD": "saveDashboard",
        "LAYOUT_CHANGE": "layoutChange",
        "DASHBOARD_INIT": "dashboardInit"
      }
    },
    "addChart": {
      "onEntry": [
        "onAddChart"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    },
    "removeChart": {
      "onEntry": [
        "onRemoveChart"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    },
    "saveDashboard": {
      "onEntry": [
        "onSaveDashboard"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    },
    "layoutChange": {
      "onEntry": [
        "onLayoutChange"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    },
    "dashboardInit": {
      "onEntry": [
        "onDashboardInit"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    }
  }
};
const initialState = {
  charts: []
};

function reducer(state, action) {
  switch (action.type) {
    case DashboardPageActions.State.ADD_CHART:
      return {
        ...state,
        charts: [
          ...action.charts
        ]
      };
    case DashboardPageActions.State.REMOVE_CHART:
      return {
        ...state,
        charts: [
          action.charts
        ]
      };
    case DashboardPageActions.State.SAVE_DASHBOARD:
      return {
        ...state
      };
    case DashboardPageActions.State.LAYOUT_CHANGE:
      return {
        ...state,
        charts: [
          ...action.charts
        ]
      };
    case DashboardPageActions.State.DASHBOARD_INIT:
      return {
        ...state,
        charts: [
          ...action.chartItems
        ]
      };
    default:
      return state === undefined ? initialState :
        Object.keys(state).length === 0 ? initialState : state;
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    onAddChart: (evt) => dispatch(doAddChart(evt)),
    onRemoveChart: (evt) => dispatch(doRemoveChart(evt)),
    onSaveDashboard: (evt) => dispatch(doSaveDashboard(evt)),
    onLayoutChange: (evt) => dispatch(doChangeLayout(evt)),
    onDashboardInit: (evt) => dispatch(doDashboardInit(evt)),
  };
};

export function doAddChart(evt) {
  return async (getState, dispatch, transition) => {
    const state = getState();
    const chartToAdd = { ...evt.chartToAdd, id: getNewId(), layout: JSON.stringify({}) };
    dispatch({
      type: DashboardPageActions.State.ADD_CHART,
      charts: [...state.charts, chartToAdd]
    });
    transition({
      type: "HIDE_INDICATOR",
    });
    transition({
      type: DashboardPageActions.State.ON_LOADED
    });
  };
}

export function doRemoveChart(evt) {
  return async (getState, dispatch, transition) => {

  };
}

export function doChangeLayout(evt) {
  return async (getState, dispatch, transition) => {
    const dashboardItems = getState();
    let charts = [];
    evt.layout.forEach(l => {
      const item = dashboardItems.charts.find(i => i.id.toString() === l.i);
      const toUpdate = JSON.stringify({
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h
      });
      const chartItem = { ...item, layout: toUpdate };
      charts.push(chartItem);
    });
    dispatch({
      type: DashboardPageActions.State.LAYOUT_CHANGE,
      charts: charts
    });
    transition({
      type: DashboardPageActions.State.ON_LOADED
    });
  };
}

export function doSaveDashboard(evt) {
  return async (getState, dispatch, transition) => {
    transition({
      type: "SHOW_INDICATOR",
      loadingMessage: "loading",
    });
    const dashboardItems = getState();
    const datasource = await initializeDatasource();
    const session = await datasource.getSession();
    const dashboarddatasource = dataLoader.getLoader("dashboardDataSource");
    const dashboardId = getUrlParamValue("dashboardId");
    const dashboardDoc = await dashboarddatasource.getAll("dashboard", { filter: `*,cmis:objectId eq ${dashboardId}` });
    const dashboardName = dashboardDoc[0]["cmis:name"];
    await session.setContentStream(dashboardDoc[0]["cmis:objectId"], JSON.stringify(dashboardItems.charts), true, dashboardName);
    dispatch({
      type: DashboardPageActions.State.SAVE_DASHBOARD
    });
    transition({
      type: "HIDE_INDICATOR",
    });
    transition({
      type: DashboardPageActions.State.ON_LOADED
    });
  };
}

export function doDashboardInit(evt) {
  return async (getState, dispatch, transition) => {
    dispatch({
      type: DashboardPageActions.State.DASHBOARD_INIT,
      chartItems: evt.chartItems
    });
    transition({
      type: DashboardPageActions.State.ON_LOADED
    });
  };
}

export async function getCubeURL() {
  const configData = dataLoader.getLoader("config");
  const cfg = await configData.getConfig();
  let apiURL;
  if (cfg["CubeJSURL"] !== undefined) {
    apiURL = cfg["CubeJSURL"];
  } else {
    apiURL = await getApiURL();
  }
  return apiURL;
}

const deserializeItem = i => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
});

const defaultLayout = (i, resizable) => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || 4,
  h: i.layout.h || 8,
  minW: 4,
  minH: 8,
  static: !resizable
});

const Dashboard = (props) => {
  const [state, transition] = useTransition("dashboard", reducer, mapDispatchToProps, stateJSON);
  const [isDragging, setIsDragging] = useState(false);
  const [apiURL, setApiURL] = useState("");
  const [isResizable, setIsResizable] = useState(true);
  useEffect(() => {
    async function fetchData() {
      setApiURL(await getCubeURL());
      const resizable = props && props.schema && props.schema.resizable ? props.schema.resizable : props.resizable ? props.resizable : false;
      setIsResizable(resizable);
      const datasource = dataLoader.getLoader("appSchemaProvider");
      datasource.setAnotherLoader(new DynamicAppSchemaProvider());
      let dashboardItems = [];
      dashboardItems = await datasource.getSchema(`/app/dashboard/${props.schema["dashboardId"]}/data`)
      transition({
        type: DashboardPageActions.State.DASHBOARD_INIT,
        chartItems: Array.isArray(dashboardItems) && dashboardItems.length > 0 ? dashboardItems : []
      });
    }
    fetchData();
  }, []);

  const onLayoutChange = (newLayout) => {
    transition({
      type: "LAYOUT_CHANGE",
      layout: newLayout
    });
  };

  const cubeAPI = cubejs("", {
    apiUrl: `${apiURL}/cubejs-api/v1`
  });

  const dashboardItem = (item) => (
    <div key={item.id} data-grid={defaultLayout(item, isResizable)}>
      <DashboardItem key={item.id} itemId={item.id} title={item.name}>
        <ChartRenderer vizState={item.vizState} />
      </DashboardItem>
    </div>
  );

  const Empty = () => (
    <div
      style={{
        textAlign: "center",
        padding: 12
      }}
    >
      <h2>There are no charts on this dashboard</h2>
    </div>
  );

  return (state.charts !== undefined ? (state.charts.length ? (
    <span>
      <div>
        <CubeProvider cubejsApi={cubeAPI}>
          <ReactGridLayout cols={12} onLayoutChange={onLayoutChange} rowHeight={40}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onResizeStart={() => setIsDragging(true)}
            onResizeStop={() => setIsDragging(false)}
            isDragging={isDragging}
            isResizable={isResizable}>
            {state.charts.map(deserializeItem).map(dashboardItem)}
          </ReactGridLayout>
        </CubeProvider>
      </div>
    </span>
  ) : <Empty />) : <Empty />);
};

Dashboard.displayName = 'Dashboard';

WidgetsFactory.instance.registerFactory(Dashboard);
WidgetsFactory.instance.registerControls({
  dashboard_control: 'Dashboard'
});