/* *
 *
 *  (c) 2010-2019 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import Highcharts from './Globals.js';
/**
 * Gets fired when the legend item belonging to a point is clicked. The default
 * action is to toggle the visibility of the point. This can be prevented by
 * returning `false` or calling `event.preventDefault()`.
 *
 * @callback Highcharts.PointLegendItemClickCallbackFunction
 *
 * @param {Highcharts.Point} this
 *        The point on which the event occured.
 *
 * @param {Highcharts.PointLegendItemClickEventObject} event
 *        The event that occured.
 */
/**
 * Information about the legend click event.
 *
 * @interface Highcharts.PointLegendItemClickEventObject
 */ /**
* Related browser event.
* @name Highcharts.PointLegendItemClickEventObject#browserEvent
* @type {Highcharts.PointerEvent}
*/ /**
* Prevent the default action of toggle the visibility of the point.
* @name Highcharts.PointLegendItemClickEventObject#preventDefault
* @type {Function}
*/ /**
* Related point.
* @name Highcharts.PointLegendItemClickEventObject#target
* @type {Highcharts.Point}
*/ /**
* Event type.
* @name Highcharts.PointLegendItemClickEventObject#type
* @type {"legendItemClick"}
*/
/**
 * Gets fired when the legend item belonging to a series is clicked. The default
 * action is to toggle the visibility of the series. This can be prevented by
 * returning `false` or calling `event.preventDefault()`.
 *
 * @callback Highcharts.SeriesLegendItemClickCallbackFunction
 *
 * @param {Highcharts.Series} this
 *        The series where the event occured.
 *
 * @param {Highcharts.SeriesLegendItemClickEventObject} event
 *        The event that occured.
 */
/**
 * Information about the legend click event.
 *
 * @interface Highcharts.SeriesLegendItemClickEventObject
 */ /**
* Related browser event.
* @name Highcharts.SeriesLegendItemClickEventObject#browserEvent
* @type {Highcharts.PointerEvent}
*/ /**
* Prevent the default action of toggle the visibility of the series.
* @name Highcharts.SeriesLegendItemClickEventObject#preventDefault
* @type {Function}
*/ /**
* Related series.
* @name Highcharts.SeriesLegendItemClickEventObject#target
* @type {Highcharts.Series}
*/ /**
* Event type.
* @name Highcharts.SeriesLegendItemClickEventObject#type
* @type {"legendItemClick"}
*/
import U from './Utilities.js';
var defined = U.defined, discardElement = U.discardElement, isNumber = U.isNumber, pick = U.pick, relativeLength = U.relativeLength, setAnimation = U.setAnimation, syncTimeout = U.syncTimeout, wrap = U.wrap;
var H = Highcharts, addEvent = H.addEvent, css = H.css, fireEvent = H.fireEvent, isFirefox = H.isFirefox, marginNames = H.marginNames, merge = H.merge, stableSort = H.stableSort, win = H.win;
/* eslint-disable no-invalid-this, valid-jsdoc */
/**
 * The overview of the chart's series. The legend object is instanciated
 * internally in the chart constructor, and is available from the `chart.legend`
 * property. Each chart has only one legend.
 *
 * @class
 * @name Highcharts.Legend
 *
 * @param {Highcharts.Chart} chart
 *        The chart instance.
 *
 * @param {Highcharts.LegendOptions} options
 *        Legend options.
 */
Highcharts.Legend = function (chart, options) {
    this.init(chart, options);
};
Highcharts.Legend.prototype = {
    /**
     * Initialize the legend.
     *
     * @private
     * @function Highcharts.Legend#init
     *
     * @param {Highcharts.Chart} chart
     *        The chart instance.
     *
     * @param {Highcharts.LegendOptions} options
     *        Legend options.
     *
     * @return {void}
     */
    init: function (chart, options) {
        /**
         * Chart of this legend.
         *
         * @readonly
         * @name Highcharts.Legend#chart
         * @type {Highcharts.Chart}
         */
        this.chart = chart;
        this.setOptions(options);
        if (options.enabled) {
            // Render it
            this.render();
            // move checkboxes
            addEvent(this.chart, 'endResize', function () {
                this.legend.positionCheckboxes();
            });
            if (this.proximate) {
                this.unchartrender = addEvent(this.chart, 'render', function () {
                    this.legend.proximatePositions();
                    this.legend.positionItems();
                });
            }
            else if (this.unchartrender) {
                this.unchartrender();
            }
        }
    },
    /**
     * @private
     * @function Highcharts.Legend#setOptions
     * @param {Highcharts.LegendOptions} options
     * @return {void}
     */
    setOptions: function (options) {
        var padding = pick(options.padding, 8);
        /**
         * Legend options.
         *
         * @readonly
         * @name Highcharts.Legend#options
         * @type {Highcharts.LegendOptions}
         */
        this.options = options;
        if (!this.chart.styledMode) {
            this.itemStyle = options.itemStyle;
            this.itemHiddenStyle = merge(this.itemStyle, options.itemHiddenStyle);
        }
        this.itemMarginTop = options.itemMarginTop || 0;
        this.itemMarginBottom = options.itemMarginBottom || 0;
        this.padding = padding;
        this.initialItemY = padding - 5; // 5 is pixels above the text
        this.symbolWidth = pick(options.symbolWidth, 16);
        this.pages = [];
        this.proximate = options.layout === 'proximate' && !this.chart.inverted;
        fireEvent(this, 'afterSetOptions');
    },
    /**
     * Update the legend with new options. Equivalent to running `chart.update`
     * with a legend configuration option.
     *
     * @sample highcharts/legend/legend-update/
     *         Legend update
     *
     * @function Highcharts.Legend#update
     *
     * @param {Highcharts.LegendOptions} options
     *        Legend options.
     *
     * @param {boolean} [redraw=true]
     *        Whether to redraw the chart after the axis is altered. If doing
     *        more operations on the chart, it is a good idea to set redraw to
     *        false and call {@link Chart#redraw} after.
     *        Whether to redraw the chart.
     *
     * @return {void}
     *
     * @fires Highcharts.Legends#event:afterUpdate
     */
    update: function (options, redraw) {
        var chart = this.chart;
        this.setOptions(merge(true, this.options, options));
        this.destroy();
        chart.isDirtyLegend = chart.isDirtyBox = true;
        if (pick(redraw, true)) {
            chart.redraw();
        }
        fireEvent(this, 'afterUpdate');
    },
    /**
     * Set the colors for the legend item.
     *
     * @private
     * @function Highcharts.Legend#colorizeItem
     * @param {Highcharts.BubbleLegend|Highcharts.Point|Highcharts.Series} item
     *        A Series or Point instance
     * @param {boolean} [visible=false]
     *        Dimmed or colored
     * @return {void}
     *
     * @todo
     * Make events official: Fires the event `afterColorizeItem`.
     */
    colorizeItem: function (item, visible) {
        item.legendGroup[visible ? 'removeClass' : 'addClass']('highcharts-legend-item-hidden');
        if (!this.chart.styledMode) {
            var legend = this, options = legend.options, legendItem = item.legendItem, legendLine = item.legendLine, legendSymbol = item.legendSymbol, hiddenColor = legend.itemHiddenStyle.color, textColor = visible ?
                options.itemStyle.color :
                hiddenColor, symbolColor = visible ?
                (item.color || hiddenColor) :
                hiddenColor, markerOptions = item.options && item.options.marker, symbolAttr = { fill: symbolColor };
            if (legendItem) {
                legendItem.css({
                    fill: textColor,
                    color: textColor // #1553, oldIE
                });
            }
            if (legendLine) {
                legendLine.attr({ stroke: symbolColor });
            }
            if (legendSymbol) {
                // Apply marker options
                if (markerOptions && legendSymbol.isMarker) { // #585
                    symbolAttr = item.pointAttribs();
                    if (!visible) {
                        // #6769
                        symbolAttr.stroke = symbolAttr.fill = hiddenColor;
                    }
                }
                legendSymbol.attr(symbolAttr);
            }
        }
        fireEvent(this, 'afterColorizeItem', { item: item, visible: visible });
    },
    /**
     * @private
     * @function Highcharts.Legend#positionItems
     * @return {void}
     */
    positionItems: function () {
        // Now that the legend width and height are established, put the items
        // in the final position
        this.allItems.forEach(this.positionItem, this);
        if (!this.chart.isResizing) {
            this.positionCheckboxes();
        }
    },
    /**
     * Position the legend item.
     *
     * @private
     * @function Highcharts.Legend#positionItem
     * @param {Highcharts.BubbleLegend|Highcharts.Point|Highcharts.Series} item
     *        The item to position
     * @return {void}
     */
    positionItem: function (item) {
        var legend = this, options = legend.options, symbolPadding = options.symbolPadding, ltr = !options.rtl, legendItemPos = item._legendItemPos, itemX = legendItemPos[0], itemY = legendItemPos[1], checkbox = item.checkbox, legendGroup = item.legendGroup;
        if (legendGroup && legendGroup.element) {
            legendGroup[defined(legendGroup.translateY) ? 'animate' : 'attr']({
                translateX: ltr ?
                    itemX :
                    legend.legendWidth - itemX - 2 * symbolPadding - 4,
                translateY: itemY
            });
        }
        if (checkbox) {
            checkbox.x = itemX;
            checkbox.y = itemY;
        }
    },
    /**
     * Destroy a single legend item, used internally on removing series items.
     *
     * @private
     * @function Highcharts.Legend#destroyItem
     * @param {Highcharts.BubbleLegend|Highcharts.Point|Highcharts.Series} item
     *        The item to remove
     * @return {void}
     */
    destroyItem: function (item) {
        var checkbox = item.checkbox;
        // destroy SVG elements
        ['legendItem', 'legendLine', 'legendSymbol', 'legendGroup'].forEach(function (key) {
            if (item[key]) {
                item[key] = item[key].destroy();
            }
        });
        if (checkbox) {
            discardElement(item.checkbox);
        }
    },
    /**
     * Destroy the legend. Used internally. To reflow objects, `chart.redraw`
     * must be called after destruction.
     *
     * @private
     * @function Highcharts.Legend#destroy
     * @return {void}
     */
    destroy: function () {
        /**
         * @private
         * @param {string} key
         * @return {void}
         */
        function destroyItems(key) {
            if (this[key]) {
                this[key] = this[key].destroy();
            }
        }
        // Destroy items
        this.getAllItems().forEach(function (item) {
            ['legendItem', 'legendGroup'].forEach(destroyItems, item);
        });
        // Destroy legend elements
        [
            'clipRect',
            'up',
            'down',
            'pager',
            'nav',
            'box',
            'title',
            'group'
        ].forEach(destroyItems, this);
        this.display = null; // Reset in .render on update.
    },
    /**
     * Position the checkboxes after the width is determined.
     *
     * @private
     * @function Highcharts.Legend#positionCheckboxes
     * @return {void}
     */
    positionCheckboxes: function () {
        var alignAttr = this.group && this.group.alignAttr, translateY, clipHeight = this.clipHeight || this.legendHeight, titleHeight = this.titleHeight;
        if (alignAttr) {
            translateY = alignAttr.translateY;
            this.allItems.forEach(function (item) {
                var checkbox = item.checkbox, top;
                if (checkbox) {
                    top = translateY + titleHeight + checkbox.y +
                        (this.scrollOffset || 0) + 3;
                    css(checkbox, {
                        left: (alignAttr.translateX + item.checkboxOffset +
                            checkbox.x - 20) + 'px',
                        top: top + 'px',
                        display: this.proximate || (top > translateY - 6 &&
                            top < translateY + clipHeight - 6) ?
                            '' :
                            'none'
                    });
                }
            }, this);
        }
    },
    /**
     * Render the legend title on top of the legend.
     *
     * @private
     * @function Highcharts.Legend#renderTitle
     * @return {void}
     */
    renderTitle: function () {
        var options = this.options, padding = this.padding, titleOptions = options.title, titleHeight = 0, bBox;
        if (titleOptions.text) {
            if (!this.title) {
                /**
                 * SVG element of the legend title.
                 *
                 * @readonly
                 * @name Highcharts.Legend#title
                 * @type {Highcharts.SVGElement}
                 */
                this.title = this.chart.renderer.label(titleOptions.text, padding - 3, padding - 4, null, null, null, options.useHTML, null, 'legend-title')
                    .attr({ zIndex: 1 });
                if (!this.chart.styledMode) {
                    this.title.css(titleOptions.style);
                }
                this.title.add(this.group);
            }
            // Set the max title width (#7253)
            if (!titleOptions.width) {
                this.title.css({
                    width: this.maxLegendWidth + 'px'
                });
            }
            bBox = this.title.getBBox();
            titleHeight = bBox.height;
            this.offsetWidth = bBox.width; // #1717
            this.contentGroup.attr({ translateY: titleHeight });
        }
        this.titleHeight = titleHeight;
    },
    /**
     * Set the legend item text.
     *
     * @function Highcharts.Legend#setText
     *
     * @param {Highcharts.Point|Highcharts.Series} item
     *        The item for which to update the text in the legend.
     *
     * @return {void}
     */
    setText: function (item) {
        var options = this.options;
        item.legendItem.attr({
            text: options.labelFormat ?
                H.format(options.labelFormat, item, this.chart) :
                options.labelFormatter.call(item)
        });
    },
    /**
     * Render a single specific legend item. Called internally from the `render`
     * function.
     *
     * @private
     * @function Highcharts.Legend#renderItem
     *
     * @param {Highcharts.BubbleLegend|Highcharts.Point|Highcharts.Series} item
     *        The item to render.
     *
     * @return {void}
     */
    renderItem: function (item) {
        var legend = this, chart = legend.chart, renderer = chart.renderer, options = legend.options, horizontal = options.layout === 'horizontal', symbolWidth = legend.symbolWidth, symbolPadding = options.symbolPadding, itemStyle = legend.itemStyle, itemHiddenStyle = legend.itemHiddenStyle, itemDistance = horizontal ? pick(options.itemDistance, 20) : 0, ltr = !options.rtl, bBox, li = item.legendItem, isSeries = !item.series, series = !isSeries && item.series.drawLegendSymbol ?
            item.series :
            item, seriesOptions = series.options, showCheckbox = legend.createCheckboxForItem &&
            seriesOptions &&
            seriesOptions.showCheckbox, 
        // full width minus text width
        itemExtraWidth = symbolWidth + symbolPadding +
            itemDistance + (showCheckbox ? 20 : 0), useHTML = options.useHTML, itemClassName = item.options.className;
        if (!li) { // generate it once, later move it
            // Generate the group box, a group to hold the symbol and text. Text
            // is to be appended in Legend class.
            item.legendGroup = renderer
                .g('legend-item')
                .addClass('highcharts-' + series.type + '-series ' +
                'highcharts-color-' + item.colorIndex +
                (itemClassName ? ' ' + itemClassName : '') +
                (isSeries ?
                    ' highcharts-series-' + item.index :
                    ''))
                .attr({ zIndex: 1 })
                .add(legend.scrollGroup);
            // Generate the list item text and add it to the group
            item.legendItem = li = renderer.text('', ltr ?
                symbolWidth + symbolPadding :
                -symbolPadding, legend.baseline || 0, useHTML);
            if (!chart.styledMode) {
                // merge to prevent modifying original (#1021)
                li.css(merge(item.visible ?
                    itemStyle :
                    itemHiddenStyle));
            }
            li
                .attr({
                align: ltr ? 'left' : 'right',
                zIndex: 2
            })
                .add(item.legendGroup);
            // Get the baseline for the first item - the font size is equal for
            // all
            if (!legend.baseline) {
                legend.fontMetrics = renderer.fontMetrics(chart.styledMode ? 12 : itemStyle.fontSize, li);
                legend.baseline =
                    legend.fontMetrics.f + 3 + legend.itemMarginTop;
                li.attr('y', legend.baseline);
            }
            // Draw the legend symbol inside the group box
            legend.symbolHeight =
                options.symbolHeight || legend.fontMetrics.f;
            series.drawLegendSymbol(legend, item);
            if (legend.setItemEvents) {
                legend.setItemEvents(item, li, useHTML);
            }
        }
        // Add the HTML checkbox on top
        if (showCheckbox && !item.checkbox) {
            legend.createCheckboxForItem(item);
        }
        // Colorize the items
        legend.colorizeItem(item, item.visible);
        // Take care of max width and text overflow (#6659)
        if (chart.styledMode || !itemStyle.width) {
            li.css({
                width: (options.itemWidth ||
                    legend.widthOption ||
                    chart.spacingBox.width) - itemExtraWidth
            });
        }
        // Always update the text
        legend.setText(item);
        // calculate the positions for the next line
        bBox = li.getBBox();
        item.itemWidth = item.checkboxOffset =
            options.itemWidth ||
                item.legendItemWidth ||
                bBox.width + itemExtraWidth;
        legend.maxItemWidth = Math.max(legend.maxItemWidth, item.itemWidth);
        legend.totalItemWidth += item.itemWidth;
        legend.itemHeight = item.itemHeight = Math.round(item.legendItemHeight || bBox.height || legend.symbolHeight);
    },
    /**
     * Get the position of the item in the layout. We now know the
     * maxItemWidth from the previous loop.
     *
     * @private
     * @function Highcharts.Legend#layoutItem
     *
     * @param {Highcharts.BubbleLegend|Highcharts.Point|Highcharts.Series} item
     *
     * @return {void}
     */
    layoutItem: function (item) {
        var options = this.options, padding = this.padding, horizontal = options.layout === 'horizontal', itemHeight = item.itemHeight, itemMarginBottom = this.itemMarginBottom, itemMarginTop = this.itemMarginTop, itemDistance = horizontal ? pick(options.itemDistance, 20) : 0, maxLegendWidth = this.maxLegendWidth, itemWidth = (options.alignColumns &&
            this.totalItemWidth > maxLegendWidth) ?
            this.maxItemWidth :
            item.itemWidth;
        // If the item exceeds the width, start a new line
        if (horizontal &&
            this.itemX - padding + itemWidth > maxLegendWidth) {
            this.itemX = padding;
            if (this.lastLineHeight) { // Not for the first line (#10167)
                this.itemY += (itemMarginTop +
                    this.lastLineHeight +
                    itemMarginBottom);
            }
            this.lastLineHeight = 0; // reset for next line (#915, #3976)
        }
        // Set the edge positions
        this.lastItemY = itemMarginTop + this.itemY + itemMarginBottom;
        this.lastLineHeight = Math.max(// #915
        itemHeight, this.lastLineHeight);
        // cache the position of the newly generated or reordered items
        item._legendItemPos = [this.itemX, this.itemY];
        // advance
        if (horizontal) {
            this.itemX += itemWidth;
        }
        else {
            this.itemY +=
                itemMarginTop + itemHeight + itemMarginBottom;
            this.lastLineHeight = itemHeight;
        }
        // the width of the widest item
        this.offsetWidth = this.widthOption || Math.max((horizontal ? this.itemX - padding - (item.checkbox ?
            // decrease by itemDistance only when no checkbox #4853
            0 :
            itemDistance) : itemWidth) + padding, this.offsetWidth);
    },
    /**
     * Get all items to be rendered in legend.
     * Fires the event `afterGetAllItems`.
     *
     * @private
     * @function Highcharts.Legend#getAllItems
     * @return {Array<(Highcharts.BubbleLegend|Highcharts.Point|Highcharts.Series)>}
     *         The current items in the legend.
     * @fires Highcharts.Legend#event:afterGetAllItems
     */
    getAllItems: function () {
        var allItems = [];
        this.chart.series.forEach(function (series) {
            allItems = allItems.concat(this.getSeriesItems(series));
        }, this);
        fireEvent(this, 'afterGetAllItems', { allItems: allItems });
        return allItems;
    },
    /**
     * Get items that represent a single series in legend.
     * Majority of series types are represented just by one item - series itself
     * (an array of 1 item is returned). However, pie series and its derivatives
     * are represented by their individual points (an array of mulitple
     * items is returned).
     *
     * @private
     * @function Highcharts.Legend#getSeriesItems
     * @return {Array<(Highcharts.Point|Highcharts.Series)>}
     *         Items that represent a series.
     */
    getSeriesItems: function (series) {
        var seriesOptions = series && series.options, items = [];
        // Handle showInLegend. If the series is linked to another series,
        // defaults to false.
        if (series && pick(seriesOptions.showInLegend, !defined(seriesOptions.linkedTo) ? void 0 : false, true)) {
            // Use points or series for the legend item depending on
            // legendType
            items = series.legendItems ||
                (seriesOptions.legendType === 'point' ?
                    series.data :
                    series);
        }
        return items;
    },
    /**
     * Get a short, three letter string reflecting the alignment and layout.
     *
     * @private
     * @function Highcharts.Legend#getAlignment
     *
     * @return {string}
     *         The alignment, empty string if floating
     */
    getAlignment: function () {
        var options = this.options;
        // Use the first letter of each alignment option in order to detect
        // the side. (#4189 - use charAt(x) notation instead of [x] for IE7)
        if (this.proximate) {
            return options.align.charAt(0) + 'tv';
        }
        return options.floating ? '' : (options.align.charAt(0) +
            options.verticalAlign.charAt(0) +
            options.layout.charAt(0));
    },
    /**
     * Adjust the chart margins by reserving space for the legend on only one
     * side of the chart. If the position is set to a corner, top or bottom is
     * reserved for horizontal legends and left or right for vertical ones.
     *
     * @private
     * @function Highcharts.Legend#adjustMargins
     * @param {Array<number>} margin
     * @param {Array<number>} spacing
     * @return {void}
     */
    adjustMargins: function (margin, spacing) {
        var chart = this.chart, options = this.options, alignment = this.getAlignment();
        if (alignment) {
            ([
                /(lth|ct|rth)/,
                /(rtv|rm|rbv)/,
                /(rbh|cb|lbh)/,
                /(lbv|lm|ltv)/
            ]).forEach(function (alignments, side) {
                if (alignments.test(alignment) && !defined(margin[side])) {
                    // Now we have detected on which side of the chart we should
                    // reserve space for the legend
                    chart[marginNames[side]] = Math.max(chart[marginNames[side]], (this[(side + 1) % 2 ? 'legendHeight' : 'legendWidth'] +
                        [1, -1, -1, 1][side] * this[(side % 2) ? 'xOption' : 'yOption'] +
                        pick(options.margin, 12) +
                        spacing[side] +
                        (chart.titleOffset[side] || 0)));
                }
            }, this);
        }
    },
    /**
     * @private
     * @function Highcharts.Legend#proximatePositions
     * @return {void}
     */
    proximatePositions: function () {
        var chart = this.chart, boxes = [], alignLeft = this.options.align === 'left';
        this.allItems.forEach(function (item) {
            var lastPoint, height, useFirstPoint = alignLeft, target, top;
            if (item.yAxis && item.points) {
                if (item.xAxis.options.reversed) {
                    useFirstPoint = !useFirstPoint;
                }
                lastPoint = H.find(useFirstPoint ?
                    item.points :
                    item.points.slice(0).reverse(), function (item) {
                    return isNumber(item.plotY);
                });
                height = this.itemMarginTop +
                    item.legendItem.getBBox().height +
                    this.itemMarginBottom;
                top = item.yAxis.top - chart.plotTop;
                if (item.visible) {
                    target = lastPoint ?
                        lastPoint.plotY :
                        item.yAxis.height;
                    target += top - 0.3 * height;
                }
                else {
                    target = top + item.yAxis.height;
                }
                boxes.push({
                    target: target,
                    size: height,
                    item: item
                });
            }
        }, this);
        H.distribute(boxes, chart.plotHeight);
        boxes.forEach(function (box) {
            box.item._legendItemPos[1] =
                chart.plotTop - chart.spacing[0] + box.pos;
        });
    },
    /**
     * Sort legend items using thier `index` and `legend.reversed` option.
     *
     * @private
     * @function Highcharts.sortItems
     * @return {void}
     */
    sortItems: function () {
        // sort by legendIndex
        stableSort(this.allItems, function (a, b) {
            return ((a.options && a.options.legendIndex) || 0) -
                ((b.options && b.options.legendIndex) || 0);
        });
        // reversed legend
        if (this.options.reversed) {
            this.allItems.reverse();
        }
    },
    /**
     * Create main SVG groups which legend is comprised of.
     *
     * @private
     * @function Highcharts.renderLegendGroup
     * @return {void}
     */
    renderLegendGroup: function () {
        var renderer = this.chart.renderer;
        if (!this.group) {
            /**
             * SVG group of the legend.
             *
             * @readonly
             * @name Highcharts.Legend#group
             * @type {Highcharts.SVGElement}
             */
            this.group = renderer.g('legend')
                .attr({ zIndex: 7 })
                .add();
            this.contentGroup = renderer.g()
                .attr({ zIndex: 1 }) // above background
                .add(this.group);
            this.scrollGroup = renderer.g()
                .add(this.contentGroup);
        }
    },
    /**
     * Compute `legendWidth` & `legendHeight` properties which are
     * legend's dimensions and handle overflow (height only).
     *
     * @private
     * @function Highcharts.findLegendSize
     * @return {void}
     */
    findLegendSize: function () {
        // Get the box
        this.legendWidth = (this.widthOption || this.offsetWidth) +
            this.padding;
        this.legendHeight = this.lastItemY + this.lastLineHeight +
            this.titleHeight;
        this.legendHeight = this.handleOverflow(this.legendHeight);
        this.legendHeight += this.padding;
    },
    /**
     * Create a border and background for the legend.
     *
     * @private
     * @function Highcharts.renderBox
     * @return {void}
     */
    renderBox: function () {
        var box = this.box, options = this.options;
        // Draw the border and/or background
        if (!box) {
            /**
             * SVG element of the legend box.
             *
             * @readonly
             * @name Highcharts.Legend#box
             * @type {Highcharts.SVGElement}
             */
            this.box = box = this.chart.renderer.rect()
                .addClass('highcharts-legend-box')
                .attr({
                r: this.options.borderRadius
            })
                .add(this.group);
            box.isNew = true;
        }
        // Presentational
        if (!this.chart.styledMode) {
            box
                .attr({
                stroke: options.borderColor,
                'stroke-width': options.borderWidth || 0,
                fill: options.backgroundColor || 'none'
            })
                .shadow(options.shadow);
        }
        if (this.legendWidth > 0 && this.legendHeight > 0) {
            box[box.isNew ? 'attr' : 'animate'](box.crisp.call({}, {
                x: 0,
                y: 0,
                width: this.legendWidth,
                height: this.legendHeight
            }, box.strokeWidth()));
            box.isNew = false;
        }
        // hide the border if no items
        box[this.display ? 'show' : 'hide']();
        // Open for responsiveness
        if (this.chart.styledMode &&
            this.group.getStyle('display') === 'none') {
            this.legendWidth = this.legendHeight = 0;
        }
    },
    /**
     * Align the legend to chart's box.
     *
     * @private
     * @function Highcharts.align
     * @return {void}
     */
    align: function () {
        var chart = this.chart, options = this.options;
        // If aligning to the top and the layout is horizontal, adjust for
        // the title (#7428)
        var alignTo = chart.spacingBox;
        var y = alignTo.y;
        if (/(lth|ct|rth)/.test(this.getAlignment()) &&
            chart.titleOffset[0] > 0) {
            y += chart.titleOffset[0];
        }
        else if (/(lbh|cb|rbh)/.test(this.getAlignment()) &&
            chart.titleOffset[2] > 0) {
            y -= chart.titleOffset[2];
        }
        if (y !== alignTo.y) {
            alignTo = merge(alignTo, { y: y });
        }
        this.group.align(merge(options, {
            width: this.legendWidth,
            height: this.legendHeight,
            x: this.xOption,
            y: this.yOption,
            verticalAlign: this.proximate ? 'top' : options.verticalAlign
        }), true, alignTo);
    },
    /**
     * Compute how wide the legend is allowed to be.
     *
     * @private
     * @function Highcharts.getAllowedWidth
     * @return {number}
     */
    getAllowedWidth: function () {
        var allowedWidth;
        allowedWidth = this.chart.spacingBox.width -
            2 * this.padding - this.options.x;
        // Decrease the width for right-middle & left-middle
        // positions of the legend.
        if (['rm', 'lm'].indexOf(this.getAlignment().substring(0, 2)) > -1) {
            allowedWidth /= 2;
        }
        return allowedWidth;
    },
    /**
     * Render all legend items.
     *
     * @private
     * @function Highcharts.renderItems
     * @return {void}
     */
    renderItems: function () {
        this.allItems.forEach(function (item) {
            item.legend = this;
            item.renderAsLegendItem();
        }, this);
    },
    /**
     * Layout all items.
     *
     * @private
     * @function Highcharts.layoutItems
     * @return {void}
     */
    layoutItems: function () {
        this.allItems.forEach(function (item) {
            this.layoutItem(item);
        }, this);
    },
    /**
     * Convert legend.width, legend.height, legend.x & legend.y options
     * to pixels (they can be defined as percentages in user options).
     *
     * @private
     * @function Highcharts.convertBBoxUserOptions
     * @return {void}
     */
    applyBBoxUserOptions: function () {
        var chart = this.chart, options = this.options, padding = this.padding, bBoxOptions = {
            widthOption: relativeLength(options.width, chart.spacingBox.width - padding),
            heightOption: relativeLength(options.height, chart.spacingBox.height - padding),
            xOption: relativeLength(options.x, chart.spacingBox.width - padding),
            yOption: relativeLength(options.y, chart.spacingBox.height - padding)
        };
        // Ignore all values that aren't numbers.
        H.objectEach(bBoxOptions, function (value, option) {
            if (!isNaN(value)) {
                this[option] = value;
            }
        }, this);
    },
    /**
     * Render the legend. This method can be called both before and after
     * `chart.render`. If called after, it will only rearrange items instead
     * of creating new ones. Called internally on initial render and after
     * redraws.
     *
     * @private
     * @function Highcharts.Legend#render
     * @return {void}
     */
    render: function () {
        var allItems, padding = this.padding, allowedWidth;
        fireEvent(this, 'beforeRender');
        this.applyBBoxUserOptions();
        this.itemX = padding;
        this.itemY = this.initialItemY;
        this.offsetWidth = 0;
        this.lastItemY = 0;
        allowedWidth = this.getAllowedWidth();
        this.maxLegendWidth = this.widthOption || allowedWidth;
        this.renderLegendGroup();
        this.renderTitle();
        // add each series or point
        this.allItems = allItems = this.getAllItems();
        this.sortItems();
        /**
         * All items for the legend, which is an array of series for most series
         * and an array of points for pie series and its derivatives.
         *
         * @readonly
         * @name Highcharts.Legend#allItems
         * @type {Array<(Highcharts.Point|Highcharts.Series)>}
         */
        this.allItems = allItems;
        // Don't display legend without items
        this.display = !!allItems.length;
        // Render the items. renderItems() sets the text and properties
        // and read all the bounding boxes. layoutItems() computes items'
        // positions based on the bounding boxes.
        this.lastLineHeight = 0;
        this.maxItemWidth = 0;
        this.totalItemWidth = 0;
        this.itemHeight = 0;
        this.renderItems();
        this.layoutItems();
        this.findLegendSize();
        this.renderBox();
        if (this.display) {
            this.align();
        }
        if (!this.proximate) {
            this.positionItems();
        }
        fireEvent(this, 'afterRender');
    },
    /**
     * Set up the overflow handling by adding navigation with up and down arrows
     * below the legend.
     *
     * @private
     * @function Highcharts.Legend#handleOverflow
     * @param {number} legendHeight
     * @return {number}
     */
    handleOverflow: function (legendHeight) {
        var legend = this, chart = this.chart, renderer = chart.renderer, options = this.options, padding = this.padding, spaceHeight = legend.getSpaceHeight(), maxHeight = options.maxHeight, clipHeight, clipRect = this.clipRect, navOptions = options.navigation, animation = pick(navOptions.animation, true), arrowSize = navOptions.arrowSize || 12, nav = this.nav, pages = this.pages, clipToHeight = function (height) {
            if (typeof height === 'number') {
                clipRect.attr({
                    height: height
                });
            }
            else if (clipRect) { // Reset (#5912)
                legend.clipRect = clipRect.destroy();
                legend.contentGroup.clip();
            }
            // useHTML
            if (legend.contentGroup.div) {
                legend.contentGroup.div.style.clip = height ?
                    'rect(' + padding + 'px,9999px,' +
                        (padding + height) + 'px,0)' :
                    'auto';
            }
        }, addTracker = function (key) {
            legend[key] = renderer
                .circle(0, 0, arrowSize * 1.3)
                .translate(arrowSize / 2, arrowSize / 2)
                .add(nav);
            if (!chart.styledMode) {
                legend[key].attr('fill', 'rgba(0,0,0,0.0001)');
            }
            return legend[key];
        };
        // Adjust the height
        if (options.layout === 'horizontal' &&
            options.verticalAlign !== 'middle' &&
            !options.floating && !isNumber(legend.heightOption)) {
            spaceHeight /= 2;
        }
        if (maxHeight) {
            spaceHeight = Math.min(spaceHeight, maxHeight);
        }
        // Reset the legend height and adjust the clipping rectangle
        pages.length = 0;
        if (legendHeight > spaceHeight &&
            navOptions.enabled !== false) {
            this.clipHeight = clipHeight =
                Math.max(spaceHeight - 20 - this.titleHeight - padding, 0);
            this.currentPage = pick(this.currentPage, 1);
            this.fullHeight = legendHeight;
            this.createPages(clipHeight);
            // Only apply clipping if needed. Clipping causes blurred legend in
            // PDF export (#1787)
            if (!clipRect) {
                clipRect = legend.clipRect =
                    renderer.clipRect(0, padding, 9999, 0);
                legend.contentGroup.clip(clipRect);
            }
            clipToHeight(clipHeight);
            // Add navigation elements
            if (!nav) {
                this.nav = nav = renderer.g()
                    .attr({ zIndex: 1 })
                    .add(this.group);
                this.up = renderer
                    .symbol('triangle', 0, 0, arrowSize, arrowSize)
                    .add(nav);
                addTracker('upTracker')
                    .on('click', function () {
                    legend.scroll(-1, animation);
                });
                this.pager = renderer.text('', 15, 10)
                    .addClass('highcharts-legend-navigation');
                if (!chart.styledMode) {
                    this.pager.css(navOptions.style);
                }
                this.pager.add(nav);
                this.down = renderer
                    .symbol('triangle-down', 0, 0, arrowSize, arrowSize)
                    .add(nav);
                addTracker('downTracker')
                    .on('click', function () {
                    legend.scroll(1, animation);
                });
            }
            // Set initial position
            legend.scroll(0);
            legendHeight = spaceHeight;
            // Reset
        }
        else if (nav) {
            clipToHeight();
            this.nav = nav.destroy(); // #6322
            this.scrollGroup.attr({
                translateY: 1
            });
            this.clipHeight = 0; // #1379
        }
        return this.heightOption || legendHeight;
    },
    createPages: function (clipHeight) {
        var lastY, allItems = this.allItems, pages = this.pages;
        // Fill pages with Y positions so that the top of each a legend item
        // defines the scroll top for each page (#2098)
        allItems.forEach(function (item, i) {
            var y = item._legendItemPos[1] - 1, len = pages.length, h = item.legendItem ?
                Math.round(item.legendItem.getBBox().height) :
                0;
            if (!len || (y - pages[len - 1] > clipHeight &&
                (lastY || y) !== pages[len - 1])) {
                pages.push(lastY || y);
                len++;
            }
            // Keep track of which page each item is on
            item.pageIx = len - 1;
            if (lastY) {
                allItems[i - 1].pageIx = len - 1;
            }
            if (i === allItems.length - 1 &&
                y + h - pages[len - 1] > clipHeight &&
                y !== lastY // #2617
            ) {
                pages.push(y);
                item.pageIx = len;
            }
            if (y !== lastY) {
                lastY = y;
            }
        });
    },
    /**
     * Return the maximum potential height that legend can occupy.
     * Used by `handleOverflow()` method.
     *
     * @private
     * @function Highcharts.getSpaceHeight
     * @return {number}
     */
    getSpaceHeight: function () {
        var options = this.options;
        return this.heightOption || (this.chart.spacingBox.height +
            (options.verticalAlign === 'top' ?
                -options.y : options.y) - this.padding);
    },
    /**
     * Scroll the legend by a number of pages.
     *
     * @private
     * @function Highcharts.Legend#scroll
     *
     * @param {number} scrollBy
     *        The number of pages to scroll.
     *
     * @param {boolean|Highcharts.AnimationOptionsObject} [animation]
     *        Whether and how to apply animation.
     *
     * @return {void}
     */
    scroll: function (scrollBy, animation) {
        var _this = this;
        var chart = this.chart, pages = this.pages, pageCount = pages.length, currentPage = this.currentPage + scrollBy, clipHeight = this.clipHeight, navOptions = this.options.navigation, pager = this.pager, padding = this.padding;
        // When resizing while looking at the last page
        if (currentPage > pageCount) {
            currentPage = pageCount;
        }
        if (currentPage > 0) {
            if (typeof animation !== 'undefined') {
                setAnimation(animation, chart);
            }
            this.nav.attr({
                translateX: padding,
                translateY: clipHeight + this.padding + 7 + this.titleHeight,
                visibility: 'visible'
            });
            [this.up, this.upTracker].forEach(function (elem) {
                elem.attr({
                    'class': currentPage === 1 ?
                        'highcharts-legend-nav-inactive' :
                        'highcharts-legend-nav-active'
                });
            });
            pager.attr({
                text: currentPage + '/' + pageCount
            });
            [this.down, this.downTracker].forEach(function (elem) {
                elem.attr({
                    // adjust to text width
                    x: 18 + this.pager.getBBox().width,
                    'class': currentPage === pageCount ?
                        'highcharts-legend-nav-inactive' :
                        'highcharts-legend-nav-active'
                });
            }, this);
            if (!chart.styledMode) {
                this.up
                    .attr({
                    fill: currentPage === 1 ?
                        navOptions.inactiveColor :
                        navOptions.activeColor
                });
                this.upTracker
                    .css({
                    cursor: currentPage === 1 ? 'default' : 'pointer'
                });
                this.down
                    .attr({
                    fill: currentPage === pageCount ?
                        navOptions.inactiveColor :
                        navOptions.activeColor
                });
                this.downTracker
                    .css({
                    cursor: currentPage === pageCount ?
                        'default' :
                        'pointer'
                });
            }
            this.scrollOffset = -pages[currentPage - 1] + this.initialItemY;
            this.scrollGroup.animate({
                translateY: this.scrollOffset
            });
            this.currentPage = currentPage;
            this.positionCheckboxes();
            // Fire event after scroll animation is complete
            var animOptions = H.animObject(pick(animation, chart.renderer.globalAnimation, true));
            syncTimeout(function () {
                fireEvent(_this, 'afterScroll', { currentPage: currentPage });
            }, animOptions.duration || 0);
        }
    }
};
/**
 * Legend symbol mixin.
 *
 * @private
 * @mixin Highcharts.LegendSymbolMixin
 */
H.LegendSymbolMixin = {
    /**
     * Get the series' symbol in the legend
     *
     * @private
     * @function Highcharts.LegendSymbolMixin.drawRectangle
     *
     * @param {Highcharts.Legend} legend
     *        The legend object
     *
     * @param {Highcharts.Point|Highcharts.Series} item
     *        The series (this) or point
     *
     * @return {void}
     */
    drawRectangle: function (legend, item) {
        var options = legend.options, symbolHeight = legend.symbolHeight, square = options.squareSymbol, symbolWidth = square ? symbolHeight : legend.symbolWidth;
        item.legendSymbol = this.chart.renderer.rect(square ? (legend.symbolWidth - symbolHeight) / 2 : 0, legend.baseline - symbolHeight + 1, // #3988
        symbolWidth, symbolHeight, pick(legend.options.symbolRadius, symbolHeight / 2))
            .addClass('highcharts-point')
            .attr({
            zIndex: 3
        }).add(item.legendGroup);
    },
    /**
     * Get the series' symbol in the legend. This method should be overridable
     * to create custom symbols through
     * Highcharts.seriesTypes[type].prototype.drawLegendSymbols.
     *
     * @private
     * @function Highcharts.LegendSymbolMixin.drawLineMarker
     *
     * @param {Highcharts.Legend} legend
     *        The legend object.
     *
     * @return {void}
     */
    drawLineMarker: function (legend) {
        var options = this.options, markerOptions = options.marker, radius, legendSymbol, symbolWidth = legend.symbolWidth, symbolHeight = legend.symbolHeight, generalRadius = symbolHeight / 2, renderer = this.chart.renderer, legendItemGroup = this.legendGroup, verticalCenter = legend.baseline -
            Math.round(legend.fontMetrics.b * 0.3), attr = {};
        // Draw the line
        if (!this.chart.styledMode) {
            attr = {
                'stroke-width': options.lineWidth || 0
            };
            if (options.dashStyle) {
                attr.dashstyle = options.dashStyle;
            }
        }
        this.legendLine = renderer
            .path([
            'M',
            0,
            verticalCenter,
            'L',
            symbolWidth,
            verticalCenter
        ])
            .addClass('highcharts-graph')
            .attr(attr)
            .add(legendItemGroup);
        // Draw the marker
        if (markerOptions && markerOptions.enabled !== false && symbolWidth) {
            // Do not allow the marker to be larger than the symbolHeight
            radius = Math.min(pick(markerOptions.radius, generalRadius), generalRadius);
            // Restrict symbol markers size
            if (this.symbol.indexOf('url') === 0) {
                markerOptions = merge(markerOptions, {
                    width: symbolHeight,
                    height: symbolHeight
                });
                radius = 0;
            }
            this.legendSymbol = legendSymbol = renderer.symbol(this.symbol, (symbolWidth / 2) - radius, verticalCenter - radius, 2 * radius, 2 * radius, markerOptions)
                .addClass('highcharts-point')
                .add(legendItemGroup);
            legendSymbol.isMarker = true;
        }
    }
};
// Workaround for #2030, horizontal legend items not displaying in IE11 Preview,
// and for #2580, a similar drawing flaw in Firefox 26.
// Explore if there's a general cause for this. The problem may be related
// to nested group elements, as the legend item texts are within 4 group
// elements.
if (/Trident\/7\.0/.test(win.navigator && win.navigator.userAgent) ||
    isFirefox) {
    wrap(Highcharts.Legend.prototype, 'positionItem', function (proceed, item) {
        var legend = this, 
        // If chart destroyed in sync, this is undefined (#2030)
        runPositionItem = function () {
            if (item._legendItemPos) {
                proceed.call(legend, item);
            }
        };
        // Do it now, for export and to get checkbox placement
        runPositionItem();
        // Do it after to work around the core issue
        if (!legend.bubbleLegend) {
            setTimeout(runPositionItem);
        }
    });
}
