import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import shortid from 'shortid';
import { XYChart, AreaSeries, CrossHair, LinearGradient } from '@data-ui/xy-chart';
import { smartDateVerboseFormatter } from '@superset-ui/time-format';
import { computeMaxFontSize } from './visUtils';

const CHART_MARGIN = {
  top: 4,
  right: 4,
  bottom: 4,
  left: 4,
};

const PROPORTION = {
  HEADER: 0.4,
  SUBHEADER: 0.14,
  HEADER_WITH_TRENDLINE: 0.3,
  SUBHEADER_WITH_TRENDLINE: 0.125,
  TRENDLINE: 0.3,
};

function renderTooltipFactory(formatValue) {
  return function renderTooltip({ datum }) { // eslint-disable-line
    const { x: rawDate, y: rawValue } = datum;
    const formattedDate = smartDateVerboseFormatter(rawDate);
    const value = formatValue(rawValue);

    return (
      <div style={{ padding: '4px 8px' }}>
        {formattedDate}
        <br />
        <strong>{value}</strong>
      </div>
    );
  };
}

function identity(x) {
  return x;
}

const defaultProps = {
  formatBigNumber: identity,
  width: 1230,
  height: 332,
  bigNumber: 2634,
  className: "negative",
  mainColor: "#007a87",
  showTrendLine: true,
  startYAxisAtZero: true,
  subheader: "-86.2% (2015 Q1 - 2018 Q3)",
  trendLineData: [
    {
      "x": 1443657600000,
      "y": 19030
    },
    {
      "x": 1451606400000,
      "y": 8732
    },
    {
      "x": 1459468800000,
      "y": 3809
    },
    {
      "x": 1467331200000,
      "y": 9400
    },
    {
      "x": 1475280000000,
      "y": 3289
    },
    {
      "x": 1483228800000,
      "y": 3511
    },
    {
      "x": 1491004800000,
      "y": 1742
    },
    {
      "x": 1506816000000,
      "y": 1928
    },
    {
      "x": 1514764800000,
      "y": 3700
    },
    {
      "x": 1522540800000,
      "y": 3966
    },
    {
      "x": 1530403200000,
      "y": 2634
    }
  ],
  renderTooltip: renderTooltipFactory(identity),
};

const gradientId = shortid.generate();

class App extends Component {

  getClassName() {
    const { className, showTrendLine } = defaultProps;
    const names = `big_number ${className}`;
    if (showTrendLine) {
      return names;
    }
    return `${names} no_trendline`;
  }

  createTemporaryContainer() {
    const container = document.createElement('div');
    container.className = this.getClassName();
    container.style.position = 'absolute'; // so it won't disrupt page layout
    container.style.opacity = 0;           // and not visible
    return container;
  }

  renderHeader(maxHeight) {
    const { bigNumber, formatBigNumber, width } = defaultProps;
    const text = formatBigNumber(bigNumber);

    const container = this.createTemporaryContainer();
    document.body.appendChild(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: Math.floor(width),
      maxHeight,
      className: 'header_line',
      container,
    });
    document.body.removeChild(container);

    return (
      <div
        className="header_line"
        style={{
          fontSize,
          height: maxHeight,
        }}
      >
        <span>{text}</span>
      </div>
    );
  }

  renderSubheader(maxHeight) {
    const { subheader, width } = defaultProps;
    let fontSize = 0;
    if (subheader) {
      const container = this.createTemporaryContainer();
      document.body.appendChild(container);
      fontSize = computeMaxFontSize({
        text: subheader,
        maxWidth: Math.floor(width),
        maxHeight,
        className: 'subheader_line',
        container,
      });
      document.body.removeChild(container);
    }

    return (
      <div
        className="subheader_line"
        style={{
          fontSize,
          height: maxHeight,
        }}
      >
        {subheader}
      </div>
    );
  }

  renderTrendline(maxHeight) {
    const {
      width,
      trendLineData,
      mainColor,
      subheader,
      renderTooltip,
      startYAxisAtZero,
    } = defaultProps;
    return (
      <XYChart
        ariaLabel={`Big number visualization ${subheader}`}
        xScale={{ type: 'timeUtc' }}
        yScale={{
          type: 'linear',
          includeZero: startYAxisAtZero,
        }}
        width={Math.floor(width)}
        height={maxHeight}
        margin={CHART_MARGIN}
        renderTooltip={renderTooltip}
        snapTooltipToDataX
      >
        <LinearGradient
          id={gradientId}
          from={mainColor}
          to="#fff"
        />
        <AreaSeries
          data={trendLineData}
          fill={`url(#${gradientId})`}
          stroke={mainColor}
        />
        <CrossHair
          stroke={mainColor}
          circleFill={mainColor}
          circleStroke="#fff"
          showHorizontalLine={false}
          fullHeight
          strokeDasharray="5,2"
        />
      </XYChart>
    );
  }

  render() {
    const { showTrendLine, height } = defaultProps;
    const className = this.getClassName();

    if (showTrendLine) {
      const chartHeight = Math.floor(PROPORTION.TRENDLINE * height);
      const allTextHeight = height - chartHeight;
      return (
        <div className={className}>
          <div
            className="text_container"
            style={{ height: allTextHeight }}
          >
            {this.renderHeader(Math.ceil(PROPORTION.HEADER_WITH_TRENDLINE * height))}
            {this.renderSubheader(Math.ceil(PROPORTION.SUBHEADER_WITH_TRENDLINE * height))}
          </div>
          {this.renderTrendline(chartHeight)}
        </div>
      );
    }
    return (
      <div
        className={className}
        style={{ height }}
        onClick={this.handleClick}
      >
        {this.renderHeader(Math.ceil(PROPORTION.HEADER * height))}
        {this.renderSubheader(Math.ceil(PROPORTION.SUBHEADER * height))}
      </div>
    );
  }
}

export default App;
