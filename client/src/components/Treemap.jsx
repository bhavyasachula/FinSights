import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

// Custom color palette - Purple, Teal, Red, Orange tones
const PROFESSIONAL_COLORS = [
    // "#61DDAA", // mint green
    // "#7262FD", // violet
    // "#78D3F8", // sky blue
    // "#F08BB4"  // rose
    /* "#ec596aff",  "#EF8A62", "#FDDBC7", "#F7F7F7", // neutral "#D1E5F0", "#67A9CF", "#2166AC" */

    "#ECFEFF",
    "#CFFAFE",
    "#A5F3FC",
    "#7DD3FC",
    "#BAE6FD",
    "#BFDBFE",
    "#DBEAFE",

];

const Treemap = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Memoize processed data to avoid recalculations
    const { processedData, total } = useMemo(() => {
        if (!data || data.length === 0) return { processedData: [], total: 0 };

        // Process data into individual box items
        const displayData = data
            .map(d => ({
                category: (d.category || 'Other').trim(),
                value: Math.abs(Number(d.value ?? d.amount ?? 0)),
                originalValue: Math.abs(Number(d.value ?? d.amount ?? 0))
            }))
            .filter(d => d.value > 0 && !isNaN(d.value))
            .sort((a, b) => b.value - a.value)
            .slice(0, 40); // Limit to 40 items

        const totalValue = d3.sum(displayData, d => d.originalValue);

        // Assign professional colors based on rank
        displayData.forEach((item, index) => {
            item.color = PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length];
        });

        // Apply a scaling transformation to ensure readability
        // We use Math.sqrt() to "flatten" the distribution. This makes smaller 
        // transactions larger and giants smaller, ensuring that the 70-80% 
        // of boxes the user wants to see are actually visible and labeled.
        const scaledData = displayData.map(item => {
            const originalValue = item.value;
            // Mathematical transformation for visual balance
            const visibilityValue = Math.sqrt(originalValue);

            return {
                ...item,
                originalValue,
                value: visibilityValue
            };
        });

        return {
            processedData: scaledData,
            total: totalValue
        };
    }, [data]);

    const drawChart = () => {
        if (processedData.length === 0 || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;

        // Dynamic height based on number of items
        const itemCount = processedData.length;
        const baseHeight = 450;
        const dynamicHeight = Math.max(baseHeight, Math.min(itemCount * 50, 700));
        const height = Math.max(dynamicHeight, width * 0.45);

        // Clear previous render
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        /* BUILD TREEMAP */
        const root = d3.hierarchy({ children: processedData })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.treemap()
            .tile(d3.treemapSquarify.ratio(1.5))
            .size([width, height])
            .padding(2)
            .round(true)(root);

        /* TOOLTIP */
        let tooltip = d3.select('body').select('.d3-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'd3-tooltip')
                .style('position', 'absolute')
                .style('pointer-events', 'none')
                .style('opacity', 0);
        }

        /* DRAW CELLS */
        const cells = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        // Rectangles with less rounding (4px like rounded-md)
        cells.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', d => d.data.color)
            .style('opacity', 0)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .style('opacity', 1)
                    .style('filter', 'brightness(1.15)');

                const percent = ((d.data.originalValue / total) * 100).toFixed(1);

                tooltip
                    .style('opacity', 1)
                    .html(`
                        <div style="font-weight:600;color:${d.data.color}">
                            ${d.data.category}
                        </div>
                        <div>₹${d.data.originalValue.toLocaleString()}</div>
                        <div style="font-size:12px;color:#aaa">
                            ${percent}% of total
                        </div>
                    `)
                    .style('left', event.pageX + 15 + 'px')
                    .style('top', event.pageY - 10 + 'px');
            })
            .on('mousemove', event => {
                tooltip
                    .style('left', event.pageX + 15 + 'px')
                    .style('top', event.pageY - 10 + 'px');
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('opacity', 0.9)
                    .style('filter', 'none');

                tooltip.style('opacity', 0);
            })
            .transition()
            .duration(700)
            .style('opacity', 0.9);

        /* LABELS */
        // Category label
        cells.append('text')
            .attr('x', 10)
            .attr('y', 22)
            .text(d => {
                const w = d.x1 - d.x0;
                const h = d.y1 - d.y0;
                if (w < 60 || h < 40) return '';
                const maxLen = Math.floor(w / 8);
                return d.data.category.length > maxLen
                    ? d.data.category.slice(0, maxLen - 1) + '…'
                    : d.data.category;
            })
            .attr('fill', d => {
                // Determine contrast based on background brightness
                const color = d3.hsl(d.data.color);
                return color.l > 0.7 ? '#1a1a1a' : '#f5f0f0';
            })
            .style('font-size', '16px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .transition()
            .delay(400)
            .style('opacity', 1);

        // Value label
        cells.append('text')
            .attr('x', 10)
            .attr('y', 40)
            .text(d => {
                const w = d.x1 - d.x0;
                const h = d.y1 - d.y0;
                if (w < 60 || h < 55) return '';
                return `₹${d.data.originalValue.toLocaleString()}`;
            })
            .attr('fill', d => {
                // Match category label contrast or slightly softer
                const color = d3.hsl(d.data.color);
                return color.l > 0.7 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(253, 252, 252, 0.9)';
            })
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .transition()
            .delay(500)
            .style('opacity', 1);
    };

    useEffect(() => {
        drawChart();

        const observer = new ResizeObserver(drawChart);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [processedData, total]);

    if (processedData.length === 0) {
        return (
            <div className="w-full treemap-container flex items-center justify-center text-gray-500 py-20">
                No transactions found (Filter: {'>'} ₹500)
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full treemap-container">
            <svg ref={svgRef} className="w-full" />
        </div>
    );
};

export default Treemap;
