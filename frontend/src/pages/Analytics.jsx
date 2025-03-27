import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSignOutAlt, FaChartBar, FaChartLine, FaDownload } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import logo2 from '../images/gem-singlelogo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import { fetchTickets, fetchArchivedTickets } from '../utils/api.js';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Analytics = ({toggleTheme, theme}) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [archivedTickets, setArchivedTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [overviewMetrics, setOverviewMetrics] = useState({ open: 0, inProgress: 0, closed: 0 });
  const [timeFilter, setTimeFilter] = useState("month");
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [priorityData, setPriorityData] = useState({});
  const [logo, setLogo] = useState('../images/gem_logo.png');

  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
      return new Date(dateString.replace(" ", "T"));
    }
    return new Date(dateString);
  };

  const normalizeArchivedTickets = (ticketsArray) => {
    return ticketsArray.map(ticketArr => {
      const [
        id,
        someField,
        anotherField,
        title,
        description,
        status,
        archived_at,
        resolutionInfo,
        created_at,
        severity,
        contact_method,
        name,
        timeSpent,
        additionalInfo,
      ] = ticketArr;
      
      const normalizedCreatedAt = created_at && created_at.indexOf('T') === -1
        ? created_at.replace(" ", "T")
        : created_at;
      
      return {
        id,
        title,
        description,
        status,
        created_at: normalizedCreatedAt,
        archived_at,
        severity,
        contact_method,
        name,
      };
    });
  };

  useEffect(() => {
    const theme = localStorage.getItem('theme');
            if (theme == 'light') {
            setLogo(lightLogo);
            } else if (theme == 'dark') {
            setLogo(darkLogo);
            }
    const loadTickets = async () => {
      try {
        const data = await fetchTickets();
        setTickets(data);
      } catch (error) {
        toast.error("Failed to load tickets");
      }
    };

    const loadArchivedData = async () => {
      try {
        const archived = await fetchArchivedTickets(user.id);
        const normalizedArchived = normalizeArchivedTickets(archived);
        setArchivedTickets(normalizedArchived);
      } catch (error) {
        toast.error("Failed to load archived tickets");
      }
    };

    if (user) {
      loadTickets();
      loadArchivedData();
    }
  }, [user]);

  useEffect(() => {
    const aggregatedTickets = [...tickets, ...archivedTickets];
    let cutoff;
    switch (timeFilter) {
      case "week":
        cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoff = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    }
    const filtered = aggregatedTickets.filter(ticket => parseDate(ticket.created_at) >= cutoff);
    setFilteredTickets(filtered);
  }, [tickets, archivedTickets, timeFilter]);

  useEffect(() => {
    const openCount = filteredTickets.filter(ticket => ticket.status === "Open").length;
    const inProgressCount = filteredTickets.filter(ticket => ticket.status === "In Progress").length;
    const closedCount = filteredTickets.filter(ticket => ticket.status === "Closed").length;
    setOverviewMetrics({ open: openCount, inProgress: inProgressCount, closed: closedCount });


    const trend = {};
    filteredTickets.forEach(ticket => {
    const date = parseDate(ticket.created_at).toISOString().split('T')[0];
    trend[date] = (trend[date] || 0) + 1;
    });
    const trendArray = Object.keys(trend).map(date => ({ date, count: trend[date] }));
    trendArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTrendData(trendArray);


    const catCount = {};
    filteredTickets.forEach(ticket => {
      const title = ticket.title || "Uncategorized";
      const parts = title.split(" - ");
      let cat = parts[1];
      if (cat.toLowerCase() === "other" && parts.length > 1) {
        cat = "Other";
      }
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    setCategoryData(catCount);

    const prioCount = {};
    filteredTickets.forEach(ticket => {
      const sev = ticket.severity || "Unspecified";
      prioCount[sev] = (prioCount[sev] || 0) + 1;
    });
    setPriorityData(prioCount);
  }, [filteredTickets]);

  const computeAverageResolutionTime = () => {
    if (archivedTickets.length === 0) return 0;
    let totalHours = 0;
    archivedTickets.forEach(ticket => {
      const created = parseDate(ticket.created_at);
      const archived = parseDate(ticket.archived_at);
      const diffHours = (archived - created) / (1000 * 60 * 60);
      totalHours += diffHours;
    });
    return (totalHours / archivedTickets.length).toFixed(2);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const aggregatedTickets = [...tickets, ...archivedTickets];
    let cutoff;
    switch (timeFilter) {
      case "week":
        cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoff = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    }
    const filtered = aggregatedTickets.filter(ticket => parseDate(ticket.created_at) >= cutoff);
    setFilteredTickets(filtered);
    toast.info('Filters applied');
  };

  const exportToCsv = () => {
    if (filteredTickets.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ['Name', 'Ticket ID', 'Title', 'Status', 'Severity', 'Created At'];
    const rows = filteredTickets.map(ticket => [
      ticket.name,
      ticket.id,
      ticket.title,
      ticket.status,
      ticket.severity,
      ticket.created_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
      rows.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tickets_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (!user) {
    return (
      <div className="loader-wrapper">
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  const trendChartData = {
    labels: trendData.map(item => item.date),
    datasets: [
      {
        label: 'Ticket Volume',
        data: trendData.map(item => item.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Ticket Volume Over Time' },
    },
    scales: {
        y: {
            beginAtZero: true,
        }
    }
  };

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40']
      }
    ]
  };

  const priorityChartData = {
    labels: Object.keys(priorityData),
    datasets: [
      {
        data: Object.values(priorityData),
        backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40']
      }
    ]
  };

  const pieOptionsCategory = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Ticket Categories Breakdown' },
    }
  };

  const pieOptionsPriority = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Ticket Priority Breakdown' },
    }
  };

  return (
    <div className="container mt-5 analytics-page">
      {/* Header */}
      <nav className="profile-navbar">
                      <FaArrowLeft className="react-icon" size={40} onClick={handleBack}
                      data-tooltip-id="back-tooltip"
                      data-tooltip-content="Back"
                      data-tooltip-delay-show={300}></FaArrowLeft>
                      <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                      <FaSignOutAlt className="react-icon" size={40} onClick={handleLogout}
                      data-tooltip-id="logout-tooltip"
                      data-tooltip-content="Logout"
                      data-tooltip-delay-show={300}></FaSignOutAlt>
                  </nav>
                  <nav className="backup-profile-navbar">
                      <FaArrowLeft className="react-icon" size={30} onClick={handleBack}
                      data-tooltip-id="back-tooltip"
                      data-tooltip-content="Back"
                      data-tooltip-delay-show={300}></FaArrowLeft>
                      <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
                      <FaSignOutAlt className="react-icon" size={30} onClick={handleLogout}
                      data-tooltip-id="logout-tooltip"
                      data-tooltip-content="Logout"
                      data-tooltip-delay-show={300}></FaSignOutAlt>
                  </nav>

      {/* Overview Metrics */}
      <section className="overview-metrics mt-4">
        <h3>Overview Metrics</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card metric-card p-3 mb-3">
              <FaChartBar size={40} />
              <h4 className="mt-2">Open Tickets</h4>
              <p>{overviewMetrics.open}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card metric-card p-3 mb-3">
              <FaChartBar size={40} />
              <h4 className="mt-2">In Progress Tickets</h4>
              <p>{overviewMetrics.inProgress}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card metric-card p-3 mb-3">
              <FaChartBar size={40} />
              <h4 className="mt-2">Closed Tickets</h4>
              <p>{overviewMetrics.closed}</p>
            </div>
          </div>
          <div className="col-md-12">
            <div className="card metric-card p-3 mb-3">
              <FaChartLine size={40} />
              <h4 className="mt-2">Average Resolution Time (hrs)</h4>
              <p>{computeAverageResolutionTime()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analytics */}
      <section className="visual-analytics mt-4">
        <h3>Visual Analytics</h3>
        <div className="row">
          <div className="col-md-12">
            <div className="chart-line p-3 mb-3" style={{ border: '1px dashed #ccc' }}>
              <h4>Trend Analysis</h4>
              <Line data={trendChartData} options={trendOptions} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="chart-pie1 p-3 mb-3" style={{ border: '1px dashed #ccc'}}>
              <h4>Category Breakdown</h4>
              <Pie data={categoryChartData} options={pieOptionsCategory} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="chart-pie2 p-3 mb-3" style={{ border: '1px dashed #ccc' }}>
              <h4>Priority Breakdown</h4>
              <Pie data={priorityChartData} options={pieOptionsPriority} />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Capabilities */}
      <section className="filter-section mt-4">
        <h3>Filters</h3>
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="form-row">
            <div className="form-group col-md-3">
              <label htmlFor="timeFilter">Time Range:</label>
              <select
                id="timeFilter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="form-control"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
          <div className="filter-buttons mt-3 d-flex align-items-center">
            <button type="button" className="btn-important" onClick={exportToCsv}>
              <FaDownload /> Export Data
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Analytics;
