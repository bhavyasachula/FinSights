import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

// Burn Rate Gauge - Shows spending as percentage (0-100%)
const Gauge = ({ totalDebit = 0, totalCredit = 0 }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    const drawChart = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        // Maintain a standard height but make radius proportional for responsiveness
        const height = 300;
        const radius = Math.min(width, height * 2.2) / 2.6;

        // Clear previous content
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height - 50})`);

        // Calculate burn rate percentage (0-100 scale)
        let burnRatePercent = 0;
        const debit = Number(totalDebit) || 0;
        const credit = Number(totalCredit) || 0;

        if (credit > 0) {
            burnRatePercent = Math.min(Math.round((debit / credit) * 100), 100);
        } else if (debit > 0) {
            burnRatePercent = 100;
        }

        // Define zones based on burn rate percentage (0-100)
        const zones = [
            { start: 0, end: 50, color: '#06FFA5', label: 'Saving' },     // Green
            { start: 50, end: 80, color: '#FFBE0B', label: 'Balanced' }, // Yellow
            { start: 80, end: 100, color: '#FF006E', label: 'High Burn' } // Red
        ];

        const angleScale = d3.scaleLinear()
            .domain([0, 100])
            .range([-Math.PI / 2, Math.PI / 2])
            .clamp(true);

        // Create arc generator for background sweep
        const arc = d3.arc()
            .innerRadius(radius - 35)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2);

        // Draw zone arcs
        zones.forEach(zone => {
            const zoneArc = d3.arc()
                .innerRadius(radius - 35)
                .outerRadius(radius)
                .startAngle(angleScale(zone.start))
                .endAngle(angleScale(zone.end));

            g.append('path')
                .attr('d', zoneArc)
                .attr('fill', zone.color)
                .style('opacity', 0.3);
        });

        // Determine current zone
        const currentZone =
            zones.find(z => burnRatePercent >= z.start && burnRatePercent <= z.end)
            || zones[zones.length - 1];

        // Needle angle
        const needleAngle = angleScale(burnRatePercent);

        // Draw background arc
        g.append('path')
            .datum({ endAngle: Math.PI / 2 })
            .attr('d', arc)
            .attr('fill', 'rgba(255,255,255,0.05)')
            .attr('stroke', 'rgba(255,255,255,0.1)')
            .attr('stroke-width', 1);

        // Add tick marks (0, 25, 50, 75, 100)
        const ticks = [0, 25, 50, 75, 100];
        ticks.forEach(tick => {
            const angle = angleScale(tick) - Math.PI / 2;
            const x1 = Math.cos(angle) * (radius - 45);
            const y1 = Math.sin(angle) * (radius - 45);
            const x2 = Math.cos(angle) * (radius + 5);
            const y2 = Math.sin(angle) * (radius + 5);

            g.append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('stroke', 'rgba(255,255,255,0.3)')
                .attr('stroke-width', 2);

            // Add labels
            const labelX = Math.cos(angle) * (radius + 20);
            const labelY = Math.sin(angle) * (radius + 20);

            g.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', 'rgba(255,255,255,0.5)')
                .style('font-size', `${Math.max(9, radius * 0.05)}px`)
                .text(`${tick}%`);
        });

        // Draw needle
        const needleLength = radius - 60;
        const needleGroup = g.append('g').attr('class', 'needle');

        // Needle path preserved from previous version
        needleGroup.append('path')
            .attr('d', `M 0 -8 L ${needleLength} 0 L 0 8 Z`)
            .attr('fill', currentZone.color)
            .style('filter', `drop-shadow(0 0 10px ${currentZone.color})`)
            .attr('transform', `rotate(${-180})`)
            .transition()
            .duration(1500)
            .ease(d3.easeElasticOut.amplitude(1).period(0.6))
            .attrTween('transform', function () {
                const d3AngleDeg = (needleAngle * 180) / Math.PI;
                const targetRotation = d3AngleDeg - 90;
                const i = d3.interpolate(-180, targetRotation);
                return t => `rotate(${i(t)})`;
            });

        // Needle center circle
        g.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 15)
            .attr('fill', '#1a1a1a')
            .attr('stroke', currentZone.color)
            .attr('stroke-width', 3);

        // Center percentage value
        g.append('text')
            .attr('x', 0)
            .attr('y', -70)
            .attr('text-anchor', 'middle')
            .attr('fill', currentZone.color)
            .style('font-size', `${Math.max(30, radius * 0.2)}px`)
            .style('font-weight', '800')
            .style('font-family', "'Space Grotesk', sans-serif")
            .text(`${burnRatePercent}%`);

        // Status text
        g.append('text')
            .attr('x', 0)
            .attr('y', -35)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(255,255,255,0.7)')
            .style('font-size', `${Math.max(10, radius * 0.06)}px`)
            .text('Burn Rate');

        // Right-aligned header stats (Spent/Income)
        const statsGroup = svg.append('g')
            .attr('transform', `translate(${width - 20}, 30)`);

        // Spent - Fixed alignment to "end"
        statsGroup.append('text')
            .attr('text-anchor', 'end')
            .attr('fill', '#FF006E')
            .style('font-size', `${Math.max(12, radius * 0.08)}px`)
            .style('font-weight', '700')
            .style('font-family', "'Space Grotesk', sans-serif")
            .text(`Spent: ₹${debit.toLocaleString()}`);

        // Income - Fixed alignment to "end"
        statsGroup.append('text')
            .attr('x', 0)
            .attr('y', 25)
            .attr('text-anchor', 'end')
            .attr('fill', '#06FFA5')
            .style('font-size', `${Math.max(12, radius * 0.08)}px`)
            .style('font-weight', '700')
            .style('font-family', "'Space Grotesk', sans-serif")
            .text(`Income: ₹${credit.toLocaleString()}`);

        // Zone label
        g.append('text')
            .attr('x', 0)
            .attr('y', 45)
            .attr('text-anchor', 'middle')
            .attr('fill', currentZone.color)
            .style('font-size', `${Math.max(11, radius * 0.07)}px`)
            .style('font-weight', '700')
            .text(currentZone.label.toUpperCase());


    }, [totalDebit, totalCredit]);

    useEffect(() => {
        drawChart();
        const observer = new ResizeObserver(drawChart);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [drawChart]);

    return (
        <div ref={containerRef} className="w-full flex justify-center overflow-hidden" style={{ userSelect: 'none' }}>
            <svg ref={svgRef} />
        </div>
    );
};

export default Gauge;
