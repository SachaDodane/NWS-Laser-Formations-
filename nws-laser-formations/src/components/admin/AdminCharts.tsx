'use client';

import { useEffect, useRef, useState } from 'react';
import { FadeIn } from '@/components/animations/MotionEffects';

interface EnrollmentDataPoint {
  date: string;
  count: number;
}

interface AdminChartsProps {
  enrollmentChartData: EnrollmentDataPoint[];
}

export default function AdminCharts({ enrollmentChartData }: AdminChartsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  
  useEffect(() => {
    // Dynamically import Chart.js to avoid SSR issues
    const loadChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      
      if (canvasRef.current) {
        // Destroy any existing chart
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) {
          chartInstance.destroy();
        }
        
        // Prepare data
        const labels = enrollmentChartData.map(item => item.date);
        const data = enrollmentChartData.map(item => item.count);
        
        // Format dates for display (e.g., "15 Juin")
        const formattedLabels = labels.map(dateStr => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        });
        
        // Create Chart
        new Chart(canvasRef.current, {
          type: 'line',
          data: {
            labels: formattedLabels,
            datasets: [
              {
                label: 'Nouvelles inscriptions',
                data: data,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.8)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointRadius: 3,
                pointHoverRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                beginAtZero: true,
                precision: 0,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  stepSize: 1,
                },
              },
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false,
            },
            animations: {
              tension: {
                duration: 1000,
                easing: 'linear',
              },
            },
          },
        });
        
        setChartLoaded(true);
      }
    };
    
    loadChart();
    
    // Cleanup function
    return () => {
      if (canvasRef.current) {
        const chartInstance = Chart.getChart(canvasRef.current);
        if (chartInstance) {
          chartInstance.destroy();
        }
      }
    };
  }, [enrollmentChartData]);
  
  // Calculate stats for the enrollment data
  const totalEnrollments = enrollmentChartData.reduce((sum, item) => sum + item.count, 0);
  const averageEnrollmentsPerDay = totalEnrollments / enrollmentChartData.length || 0;
  
  // Find the peak enrollment day
  const peakDay = enrollmentChartData.reduce(
    (max, item) => (item.count > max.count ? item : max),
    { date: '', count: 0 }
  );
  
  return (
    <FadeIn direction="up" delay={0.2}>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Activité récente (30 derniers jours)</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600">Inscriptions totales</p>
              <p className="text-2xl font-bold text-blue-900">{totalEnrollments}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600">Moyenne quotidienne</p>
              <p className="text-2xl font-bold text-green-900">
                {averageEnrollmentsPerDay.toFixed(1)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-600">Jour de pointe</p>
              <p className="text-2xl font-bold text-purple-900">
                {peakDay.count > 0 
                  ? `${peakDay.count} (${new Date(peakDay.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})` 
                  : 'Aucun'}
              </p>
            </div>
          </div>
          
          <div className="relative h-80">
            {!chartLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
