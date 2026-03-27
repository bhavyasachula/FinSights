import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    const drawChart = () => {
        if (!data || data.length === 0 || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;

        /* ----------------------------------
           1️⃣ NORMALIZE + AGGREGATE MERCHANTS
        ---------------------------------- */

        const merchantMap = {};

        data.forEach(d => {
            const name = (d.name || d.merchant || 'Unknown').trim();
            const value = Math.abs(Number(d.total_spend ?? d.amount ?? 0));

            if (!value || isNaN(value)) return;

            merchantMap[name] = (merchantMap[name] || 0) + value;
        });

        const aggregatedData = Object.entries(merchantMap)
            .map(([name, total_spend]) => ({ name, total_spend }))
            .sort((a, b) => b.total_spend - a.total_spend)
            .slice(0, 12);

        if (aggregatedData.length === 0) return;

        /* ----------------------------------
           2️⃣ DIMENSIONS - Flexible based on container
        ---------------------------------- */

        const itemHeight = 45;
        const height = Math.max(300, aggregatedData.length * itemHeight + 40);

        // Responsive margins based on container width
        const leftMargin = Math.min(160, Math.max(100, width * 0.2));
        const rightMargin = Math.min(100, Math.max(60, width * 0.12));

        const margin = { top: 15, right: rightMargin, bottom: 15, left: leftMargin };
        const innerWidth = Math.max(100, width - margin.left - margin.right);
        const innerHeight = height - margin.top - margin.bottom;

        // Clear previous render
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        /* ----------------------------------
           3️⃣ SCALES
        ---------------------------------- */

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(aggregatedData, d => d.total_spend)])
            .range([0, innerWidth]);

        const yScale = d3.scaleBand()
            .domain(aggregatedData.map(d => d.name))
            .range([0, innerHeight])
            .padding(0.25);

        const barColor = '#3A86FF';
        const secondaryColor = '#06FFA5';

        // 4️⃣ GRADIENTS
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'bar-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', barColor);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', secondaryColor);

        /* ----------------------------------
           6️⃣ TOOLTIP
        ---------------------------------- */

        let tooltip = d3.select('body').select('.d3-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'd3-tooltip')
                .style('position', 'absolute')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .style('background', 'rgba(20, 20, 20, 0.95)')
                .style('backdrop-filter', 'blur(8px)')
                .style('padding', '12px 16px')
                .style('border-radius', '12px')
                .style('box-shadow', '0 10px 25px rgba(0,0,0,0.5)')
                .style('z-index', '1000');
        }

        /* ----------------------------------
           7️⃣ MERCHANT LABELS - Responsive text
        ---------------------------------- */

        const maxLabelLen = Math.floor(leftMargin / 7);

        g.selectAll('.y-label')
            .data(aggregatedData)
            .enter()
            .append('text')
            .attr('x', -12)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('fill', 'rgba(255, 255, 255, 0.6)')
            .style('font-size', width < 500 ? '11px' : '13px')
            .style('font-weight', '500')
            .style('font-family', 'Inter, system-ui, sans-serif')
            .text(d =>
                d.name.length > maxLabelLen ? d.name.slice(0, maxLabelLen) + '…' : d.name
            );

        /* ----------------------------------
           8️⃣ BARS
        ---------------------------------- */

        const bars = g.selectAll('.bar')
            .data(aggregatedData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.name))
            .attr('height', yScale.bandwidth())
            .attr('width', 0)
            .attr('rx', 6)
            .attr('fill', 'url(#bar-gradient)')
            .style('opacity', 0.8)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition().duration(200)
                    .style('opacity', 1)
                    .style('filter', `brightness(1.2) drop-shadow(0 0 12px ${barColor}40)`);

                tooltip
                    .transition().duration(200)
                    .style('opacity', 1);

                tooltip
                    .html(`
                        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.5);margin-bottom:4px">Merchant</div>
                        <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:8px">${d.name}</div>
                        <div style="height:1px;background:rgba(255, 255, 255, 0.1);margin-bottom:8px"></div>
                        <div style="font-size:12px;color:rgba(255,255,255,0.5)">Total Spend</div>
                        <div style="font-size:20px;font-weight:800;color:${secondaryColor}">₹${d.total_spend.toLocaleString()}</div>
                    `)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY - 40 + 'px');
            })
            .on('mousemove', event => {
                tooltip
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY - 40 + 'px');
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition().duration(200)
                    .style('opacity', 0.8)
                    .style('filter', 'none');

                tooltip
                    .transition().duration(200)
                    .style('opacity', 0);
            });

        bars.transition()
            .duration(1000)
            .delay((_, i) => i * 100)
            .ease(d3.easeElasticOut.amplitude(1).period(0.4))
            .attr('width', d => xScale(d.total_spend));

        /* ----------------------------------
           9️⃣ VALUE LABELS
        ---------------------------------- */

        g.selectAll('.value-label')
            .data(aggregatedData)
            .enter()
            .append('text')
            .attr('x', d => xScale(d.total_spend) + 12)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('fill', 'rgba(255, 255, 255, 0.9)')
            .style('font-size', width < 500 ? '10px' : '12px')
            .style('font-weight', '600')
            .style('opacity', 0)
            .text(d => `₹${d.total_spend.toLocaleString()}`)
            .transition()
            .delay((_, i) => i * 100 + 800)
            .style('opacity', 1);
    };

    useEffect(() => {
        drawChart();

        // Add resize observer for responsiveness
        const observer = new ResizeObserver(drawChart);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [data]);

    return (
        <div ref={containerRef} className="w-full">
            <svg ref={svgRef} className="w-full" />
        </div>
    );
};

export default BarChart;
