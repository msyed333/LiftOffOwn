import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

export default function Admin(){
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [displayedBookings, setDisplayedBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [displayedSellers, setDisplayedSellers] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [displayedApproved, setDisplayedApproved] = useState([]);
  const [approvedQuery, setApprovedQuery] = useState('');
  const [approvedHasSearched, setApprovedHasSearched] = useState(false);
  const [showAllApproved, setShowAllApproved] = useState(false);
  const [flights, setFlights] = useState([]);
  const [sellerQuery, setSellerQuery] = useState('');
  const [sellerHasSearched, setSellerHasSearched] = useState(false);
  const [showAllSellers, setShowAllSellers] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [bookingQuery, setBookingQuery] = useState('');
  const [userHasSearched, setUserHasSearched] = useState(false);
  const [bookingHasSearched, setBookingHasSearched] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState({ type: null, id: null });

  async function fetchUsers(){
    const url = userQuery ? `http://localhost:9000/admin/users?q=${encodeURIComponent(userQuery)}` : 'http://localhost:9000/admin/users';
    const res = await fetch(url);
    const json = await res.json();
  const list = json.users || [];
  // show only non-seller users in the Users section
  const onlyUsers = list.filter(u => !u.isSeller);
  setUsers(onlyUsers);
  setDisplayedUsers(onlyUsers);
  }

  async function fetchBookings(){
    const url = bookingQuery ? `http://localhost:9000/admin/bookings?q=${encodeURIComponent(bookingQuery)}` : 'http://localhost:9000/admin/bookings';
    const res = await fetch(url);
    const json = await res.json();
  const list = json.bookings || [];
  setBookings(list);
  setDisplayedBookings(list);
  }

  async function fetchTickets(){
    const res = await fetch('http://localhost:9000/admin/tickets');
    const json = await res.json();
    setTickets(json.tickets || []);
  }

  async function fetchFlights(){
    try{
      const res = await fetch('http://localhost:9000/flights');
      const json = await res.json();
      setFlights(json || []);
    }catch(err){ console.error('Failed to fetch flights', err); }
  }

  async function toggleTicketComplete(id){
    try{
      const res = await fetch(`http://localhost:9000/admin/ticket/${id}/toggleComplete`, { method: 'POST' });
      const json = await res.json();
      if(json.ticket){
        // update local tickets array
        setTickets(prev => prev.map(t => t._id === id ? json.ticket : t));
      }
    }catch(err){ console.error(err); }
  }

  // async function fetchSellers(){
  //   const url = sellerQuery ? `http://localhost:9000/admin/sellers?q=${encodeURIComponent(sellerQuery)}` : 'http://localhost:9000/admin/sellers';
  //   const res = await fetch(url);
  //   const json = await res.json();
  //   const list = json.sellers || [];
  //   setSellers(list);
  //   setDisplayedSellers(list);
  // }

  async function fetchSellers() {
  const res = await fetch('http://localhost:9000/admin/sellerApplications');
  const json = await res.json();
  const list = json.pending || [];
  setSellers(list);
  setDisplayedSellers(list);
}

async function fetchApprovedSellers(){
  // fetch approved seller applications from sellerApplications collection
  const url = approvedQuery ? `http://localhost:9000/admin/approvedSellerApplications?q=${encodeURIComponent(approvedQuery)}` : 'http://localhost:9000/admin/approvedSellerApplications';
  const res = await fetch(url);
  const json = await res.json();
  const list = json.approved || [];
  setApprovedSellers(list);
  setDisplayedApproved(list);
}


  React.useEffect(()=>{ fetchUsers(); fetchBookings(); fetchTickets(); }, []);
  React.useEffect(()=>{ fetchSellers(); }, []);
  React.useEffect(()=>{ fetchFlights(); }, []);
  React.useEffect(()=>{ fetchApprovedSellers(); }, []);

  // derived analytics
  const ratedFlights = flights.filter(f => f.rating !== undefined && f.rating !== null && !isNaN(parseFloat(f.rating)));
  const avgFlightRating = ratedFlights.length ? (ratedFlights.reduce((s,f)=>s + parseFloat(f.rating), 0) / ratedFlights.length).toFixed(1) : '—';
  // per-airline averages
  const airlineMap = {};
  flights.forEach(f => {
    if (!f.airline) return;
    const r = parseFloat(f.rating);
    if (isNaN(r)) return;
    if (!airlineMap[f.airline]) airlineMap[f.airline] = { sum: 0, n: 0 };
    airlineMap[f.airline].sum += r;
    airlineMap[f.airline].n += 1;
  });
  const airlineAverages = Object.entries(airlineMap).map(([airline, v]) => ({ airline, avg: (v.sum / v.n).toFixed(1), count: v.n })).sort((a,b) => b.count - a.count);

  // rating distribution 1..5
  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  ratedFlights.forEach(f => {
    let r = Math.round(parseFloat(f.rating));
    if (r < 1) r = 1; if (r > 5) r = 5;
    ratingDist[r] = (ratingDist[r] || 0) + 1;
  });
  const maxDist = Math.max(...Object.values(ratingDist), 1);
  const totalRatings = Object.values(ratingDist).reduce((s,v)=>s+v, 0);

  // additional KPI metrics
  const totalBookings = bookings.length;
  const revenue = bookings.reduce((s,b)=>s + (parseFloat(b.price)||0), 0);
  const estProfit = revenue * 0.15;
  const openTicketsCount = tickets.filter(t=>!t.completed).length;
  const flightsCount = flights.length;
  const onTimeCount = flights.filter(f => (f.onTimePercentage||0) >= 90).length;
  const onTimePercent = flightsCount ? Math.round((onTimeCount / flightsCount) * 100) : 0;
  const lateCount = flights.filter(f => (f.onTimePercentage||0) < 90 && (f.averageDelayMin||0) > 15).length;
  const latePercent = flightsCount ? Math.round((lateCount / flightsCount) * 100) : 0;
  const avgCancellation = flightsCount ? (flights.reduce((s,f)=>s + (parseFloat(f.cancellationRate)||0), 0) / flightsCount) : 0;

  function refreshAll(){ fetchUsers(); fetchBookings(); fetchTickets(); }

  async function deleteUser(id){
  await fetch(`http://localhost:9000/admin/user/${id}`, { method: 'DELETE' });
  fetchUsers();
  }

  async function deleteBooking(id){
  await fetch(`http://localhost:9000/admin/booking/${id}`, { method: 'DELETE' });
  fetchBookings();
  }

  async function deleteSeller(id){
    // Determine if this id belongs to an application or a real user by trying the application delete first
    try{
      const res = await fetch(`http://localhost:9000/admin/sellerApplication/${id}`, { method: 'DELETE' });
      if(res.ok){
        // removed an application (pending or approved)
        await fetchSellers();
        await fetchApprovedSellers();
        return;
      }
    }catch(err){ /* fallthrough to delete user */ }

    // fallback: delete live seller user account
    await fetch(`http://localhost:9000/admin/seller/${id}`, { method: 'DELETE' });
    await fetchSellers();
    await fetchApprovedSellers();
  }

  function openDeleteConfirm(type, id){
    setConfirmTarget({ type, id });
    setConfirmOpen(true);
  }

  async function confirmDelete(){
    const { type, id } = confirmTarget;
    if(!type || !id) return setConfirmOpen(false);
    try{
      // Use the centralized delete helpers so they run the backend call and refresh lists
      if(type === 'user') await deleteUser(id);
      else if(type === 'booking') await deleteBooking(id);
      else if(type === 'seller') await deleteSeller(id);
    }catch(err){ console.error('Delete failed', err); }
    setConfirmOpen(false);
    setConfirmTarget({ type: null, id: null });
  }

  async function approveSeller(applicationId){
    try{
      const res = await fetch('http://localhost:9000/admin/seller/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      const json = await res.json();
      if(json.success){
        await fetchSellers();
        alert('Seller approved and account created');
      } else {
        alert('Failed to approve seller');
      }
    }catch(err){ console.error(err); alert('Error approving seller'); }
  }

  return (
    <div className="admin-page-root">
      <div className="admin-hero">
        <div className="admin-hero-inner container">
          <div className="admin-header-card admin-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <h1 style={{margin:0}}>Admin Console</h1>
                <p className="muted" style={{marginTop:6}}>Manage users, bookings, airlines, sellers, and reports.</p>
              </div>
              <div>
                <button className="btn-secondary" onClick={()=>{ localStorage.removeItem('liftoffUser'); navigate('/'); }}>Logout</button>
              </div>
            </div>
          </div>

          <div className="cards-container">
            <div className="admin-cards-grid">
              {/* Analytics card - moved to top */}
              <div className="admin-card admin-card-wide">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Analytics</h3>
                    <p className="muted">Overview metrics and charts.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={()=>{ fetchUsers(); fetchBookings(); fetchTickets(); fetchSellers(); fetchFlights(); }}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:16, minHeight:260, display:'flex', gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
                      <div className={`subcard ${totalBookings > 0 ? 'kpi-good' : ''}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Total Users</div>
                        <div style={{fontSize:22, fontWeight:700}}>{users.length}</div>
                      </div>
                      <div className={`subcard ${totalBookings > 0 ? 'kpi-good' : ''}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Total Bookings</div>
                        <div style={{fontSize:22, fontWeight:700}}>{bookings.length}</div>
                      </div>
                      <div className={`subcard ${openTicketsCount > 0 ? 'kpi-bad' : 'kpi-good'}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Open Tickets</div>
                        <div style={{fontSize:22, fontWeight:700}}>{openTicketsCount}</div>
                      </div>
                      <div className={`subcard ${flightsCount > 0 ? 'kpi-good' : ''}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Total Flight Postings</div>
                        <div style={{fontSize:22, fontWeight:700}}>{flights.length}</div>
                      </div>
                      <div className={`subcard ${sellers.length > 0 ? 'kpi-bad' : 'kpi-good'}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Seller Requests</div>
                        <div style={{fontSize:22, fontWeight:700}}>{sellers.length}</div>
                      </div>
                      <div className={`subcard ${revenue > 1000 ? 'kpi-good' : revenue > 100 ? 'kpi-warning' : 'kpi-bad'}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Revenue (USD)</div>
                        <div style={{fontSize:22, fontWeight:700}}>{'$' + revenue.toFixed(2)}</div>
                      </div>
                      <div className={`subcard ${estProfit > 150 ? 'kpi-good' : estProfit > 30 ? 'kpi-warning' : 'kpi-bad'}`} style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Est. Profit</div>
                        <div style={{fontSize:22, fontWeight:700}}>{'$' + estProfit.toFixed(2)}</div>
                      </div>
                    </div>
                    <div style={{marginTop:12, display:'flex', gap:12, flexWrap:'wrap'}}>
                      <div className="subcard" style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Flights On-Time</div>
                        <div style={{fontSize:18, fontWeight:700}}>{onTimeCount}</div>
                      </div>
                      <div className="subcard" style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Flights Late</div>
                        <div style={{fontSize:18, fontWeight:700}}>{lateCount}</div>
                      </div>
                      <div className="subcard" style={{flex:1, textAlign:'center'}}>
                        <div className="muted">Average Flight Ratings</div>
                        <div style={{fontSize:18, fontWeight:700}}>{avgFlightRating}</div>
                      </div>
                      <div style={{flexBasis:'100%'}} />
                      <div className="subcard" style={{flex:2, minWidth:420}}>
                        <div className="muted">Rating distribution</div>
                        <div style={{marginTop:10}}>
                          {[5,4,3,2,1].map(r => {
                            const count = ratingDist[r] || 0;
                            const pct = totalRatings ? Math.round((count / totalRatings) * 100) : 0;
                            // colorful gradient per rating (green -> red)
                            const color = `linear-gradient(90deg, rgba(${(6-r)*30+60},${r*20+80},150,1), rgba(${(6-r)*30+90},${r*10+90},120,1))`;
                            return (
                              <div key={r} style={{display:'flex', alignItems:'center', gap:12, marginBottom:8, flexWrap:'nowrap'}}>
                                <div style={{width:28, fontWeight:700, flexShrink:0}} className="muted">{r}★</div>
                                <div style={{flex:1, minWidth:180, background:'#f3f4f6', height:12, borderRadius:8, overflow:'hidden', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.06)'}}>
                                  <div style={{width:`${pct}%`, height:'100%', background:color, transition:'width 300ms ease'}} />
                                </div>
                                <div style={{width:92, textAlign:'right', fontWeight:600, flexShrink:0, whiteSpace:'nowrap'}} className="muted">{count} ({pct}%)</div>
                              </div>
                            );
                          })}
                          {totalRatings === 0 && <div className="muted" style={{marginTop:8}}>No ratings yet</div>}
                        </div>
                      </div>
                      <div className="subcard" style={{flex:1, minWidth:160}}>
                        <div className="muted">Avg Rating by Airline</div>
                        <div style={{marginTop:8}}>
                          {airlineAverages.slice(0,5).map(a => (
                            <div key={a.airline} className="muted" style={{display:'flex', justifyContent:'space-between'}}>
                              <div>{a.airline}</div>
                              <div>{a.avg} ({a.count})</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users card */}
              <div className="admin-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Users</h3>
                    <p className="muted">Manage registered users and their points.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchUsers}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8}}>
                  <input style={{flex:1, minWidth:0}} placeholder="Search by name, email, or id" value={userQuery} onChange={e=>setUserQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') {
                    const q = userQuery.trim().toLowerCase();
                    if(q === '') setDisplayedUsers(users);
                    else setDisplayedUsers(users.filter(u => (
                      (u.username||'').toLowerCase().includes(q) ||
                      ((u.firstName||'') + ' ' + (u.lastName||'')).toLowerCase().includes(q) ||
                      (u._id||'').toLowerCase().includes(q)
                    )));
                    setUserHasSearched(true);
                  } }} />
                  <button className="btn-secondary" onClick={() => {
                    const q = userQuery.trim().toLowerCase();
                    if(q === '') setDisplayedUsers(users);
                    else setDisplayedUsers(users.filter(u => (
                      (u.username||'').toLowerCase().includes(q) ||
                      ((u.firstName||'') + ' ' + (u.lastName||'')).toLowerCase().includes(q) ||
                      (u._id||'').toLowerCase().includes(q)
                    )));
                    setUserHasSearched(true);
                  }}>Search</button>
                  <button className="btn-secondary" onClick={()=>{ setUserQuery(''); setDisplayedUsers(users); setUserHasSearched(false); }}>Clear</button>
                </div>
                {userHasSearched && displayedUsers.length > 0 && (
                  <div style={{marginTop:12}} className="admin-list">
                    {displayedUsers.map(u => (
                      <div className="admin-list-row" key={u._id}>
                        <div className="subcard">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                              <strong>{u.username || (u.firstName+' '+(u.lastName||''))}</strong>
                              <div className="muted">Points: {u.totalPoints || 0} • Id: {u._id}</div>
                            </div>
                            <div className="row-actions">
                              <button onClick={()=>openDeleteConfirm('user', u._id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginTop:8, display:'flex', justifyContent:'center'}}>
                  <button className="btn-primary" onClick={async ()=>{ await fetchUsers(); setShowAllUsers(true); }}>View all Users</button>
                </div>
              </div>

              {/* Bookings card */}
              <div className="admin-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Bookings</h3>
                    <p className="muted">View and Manage Flight Bookings.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchBookings}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8}}>
                  <input style={{flex:1, minWidth:0}} placeholder="Search by code, name, or email" value={bookingQuery} onChange={e=>setBookingQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') {
                    const q = bookingQuery.trim().toLowerCase();
                    if(q === '') setDisplayedBookings(bookings);
                    else setDisplayedBookings(bookings.filter(b => (
                      (b.confirmationCode||'').toLowerCase().includes(q) ||
                      (b.name||'').toLowerCase().includes(q) ||
                      (b.email||'').toLowerCase().includes(q) ||
                      (b.from||'').toLowerCase().includes(q) ||
                      (b.to||'').toLowerCase().includes(q)
                    )));
                    setBookingHasSearched(true);
                  } }} />
                  <button className="btn-secondary" onClick={() => {
                    const q = bookingQuery.trim().toLowerCase();
                    if(q === '') setDisplayedBookings(bookings);
                    else setDisplayedBookings(bookings.filter(b => (
                      (b.confirmationCode||'').toLowerCase().includes(q) ||
                      (b.name||'').toLowerCase().includes(q) ||
                      (b.email||'').toLowerCase().includes(q) ||
                      (b.from||'').toLowerCase().includes(q) ||
                      (b.to||'').toLowerCase().includes(q)
                    )));
                    setBookingHasSearched(true);
                  }}>Search</button>
                  <button className="btn-secondary" onClick={()=>{ setBookingQuery(''); setDisplayedBookings(bookings); setBookingHasSearched(false); }}>Clear</button>
                </div>
                {bookingHasSearched && displayedBookings.length > 0 && (
                  <div style={{marginTop:12}} className="admin-list">
                    {displayedBookings.map(b => (
                      <div className="admin-list-row" key={b._id}>
                        <div className="subcard">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                            <div style={{flex:1}}>
                              <strong>{b.confirmationCode}</strong>
                              <div className="muted">{b.name} • {b.email} • {b.date} • {b.from} → {b.to}</div>
                              <div className="muted">Price: ${b.price || 0} • Checked-in: {b.checkedIn ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="row-actions">
                              <button onClick={()=>openDeleteConfirm('booking', b._id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginTop:8, display:'flex', justifyContent:'center'}}>
                  <button className="btn-primary" onClick={async ()=>{ await fetchBookings(); setShowAllBookings(true); }}>View all Bookings</button>
                </div>
              </div>
              {showAllUsers && (
                <div className="overlay-backdrop" onClick={()=>setShowAllUsers(false)}>
                  <div className="overlay-card" onClick={(e)=>e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                      <h3 style={{margin:0}}>All Users</h3>
                      <div>
                        <button className="btn-secondary" onClick={()=>setShowAllUsers(false)}>Close</button>
                      </div>
                    </div>
                    <div style={{overflowY:'auto', maxHeight:'calc(100vh - 220px)'}}>
                      <div className="admin-list">
                        {displayedUsers.map(u => (
                          <div className="admin-list-row" key={u._id}>
                            <div className="subcard">
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                  <strong>{u.username || (u.firstName+' '+(u.lastName||''))}</strong>
                                  <div className="muted">Points: {u.totalPoints || 0} • Id: {u._id}</div>
                                </div>
                                <div className="row-actions">
                                  <button onClick={()=>openDeleteConfirm('user', u._id)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showAllBookings && (
                <div className="overlay-backdrop" onClick={()=>setShowAllBookings(false)}>
                  <div className="overlay-card" onClick={(e)=>e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                      <h3 style={{margin:0}}>All Bookings</h3>
                      <div>
                        <button className="btn-secondary" onClick={()=>setShowAllBookings(false)}>Close</button>
                      </div>
                    </div>
                    <div style={{overflowY:'auto', maxHeight:'calc(100vh - 220px)'}}>
                      <div className="admin-list">
                        {bookings.map(b => (
                          <div className="admin-list-row" key={b._id}>
                            <div className="subcard">
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                  <strong>{b.confirmationCode}</strong>
                                  <div className="muted">{b.name} • {b.email} • {b.date} • {b.from} → {b.to}</div>
                                  <div className="muted">Price: ${b.price || 0} • Checked-in: {b.checkedIn ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="row-actions">
                                  <button onClick={()=>openDeleteConfirm('booking', b._id)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="admin-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Seller Requests</h3>
                    <p className="muted">Seller accounts pending approval.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchSellers}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8}}>
                  <input style={{flex:1, minWidth:0}} placeholder="Search by name, username, or id" value={sellerQuery} onChange={e=>setSellerQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') {
                    const q = sellerQuery.trim().toLowerCase();
                    if(q === '') setDisplayedSellers(sellers);
                    else setDisplayedSellers(sellers.filter(s => (
                      (s.username||'').toLowerCase().includes(q) ||
                      (s.firstName||'').toLowerCase().includes(q) ||
                      (s.lastName||'').toLowerCase().includes(q) ||
                      (s._id||'').toLowerCase().includes(q)
                    )));
                    setSellerHasSearched(true);
                  } }} />
                  <button className="btn-secondary" onClick={() => {
                    const q = sellerQuery.trim().toLowerCase();
                    if(q === '') setDisplayedSellers(sellers);
                    else setDisplayedSellers(sellers.filter(s => (
                      (s.username||'').toLowerCase().includes(q) ||
                      (s.firstName||'').toLowerCase().includes(q) ||
                      (s.lastName||'').toLowerCase().includes(q) ||
                      (s._id||'').toLowerCase().includes(q)
                    )));
                    setSellerHasSearched(true);
                  }}>Search</button>
                  <button className="btn-secondary" onClick={()=>{ setSellerQuery(''); setDisplayedSellers(sellers); setSellerHasSearched(false); }}>Clear</button>
                </div>
                {/* Render search results in-card (above the View all button) */}
                {sellerHasSearched && displayedSellers.length > 0 && (
                  <div style={{marginTop:12}} className="admin-list">
                    {displayedSellers.map(s => (
                      <div className="admin-list-row" key={s._id}>
                        <div className="subcard">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                              <strong>{s.orgName || s.businessName || s.organizationName || s.username || (s.firstName+' '+(s.lastName||''))}</strong>
                              <div className="muted">Business #: {s.businessNumber || '—'} • Applicant: {s.fullName || (s.firstName+' '+(s.lastName||'')) || s.username}</div>
                              <div className="muted">Email: {s.businessEmail || s.username || '—'}</div>
                            </div>
                            <div className="row-actions">
                              <button onClick={()=>approveSeller(s._id)}>Approve</button>
                              <button onClick={()=>openDeleteConfirm('seller', s._id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginTop:8, display:'flex', justifyContent:'center'}}>
                  <button className="btn-primary" onClick={async ()=>{ await fetchSellers(); setShowAllSellers(true); }}>View All Sellers</button>
                </div>
              </div>
              <div className="admin-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Customer Support Tickets</h3>
                    <p className="muted">See All Customer Inquiries and Issues.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchTickets}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:8, display:'flex', justifyContent:'center'}}>
                  <button className="btn-primary" onClick={async ()=>{ await fetchTickets(); setShowAllTickets(true); }}>View All Support Tickets</button>
                </div>
                {/* Tickets are only visible in the full overlay via "View all support tickets" */}
              </div>

              {/** All Tickets overlay */}
              {typeof showAllTickets !== 'undefined' && showAllTickets && (
                <div className="overlay-backdrop" onClick={()=>setShowAllTickets(false)}>
                  <div className="overlay-card" onClick={(e)=>e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                      <h3 style={{margin:0}}>All Support Tickets</h3>
                      <div>
                        <button className="btn-secondary" onClick={()=>setShowAllTickets(false)}>Close</button>
                      </div>
                    </div>
                    <div style={{overflowY:'auto', maxHeight:'calc(100vh - 220px)'}}>
                      <div className="admin-list">
                        {tickets.map(t => (
                          <div className="admin-list-row" key={t._id}>
                            <div className={`subcard ${t.completed ? 'subcard-completed' : ''}`}>
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                  <strong>{t.email}</strong>
                                  <div className="muted">{new Date(t.createdAt).toLocaleString()} • Id: {t._id}</div>
                                  <div style={{marginTop:8}}>{t.message}</div>
                                </div>
                                <div className="row-actions">
                                  <button onClick={()=>toggleTicketComplete(t._id)}>{t.completed ? 'Reopen' : 'Mark Completed'}</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )} 
              

              {showAllApproved && (
                <div className="overlay-backdrop" onClick={()=>setShowAllApproved(false)}>
                  <div className="overlay-card" onClick={(e)=>e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                      <h3 style={{margin:0}}>Approved Sellers</h3>
                      <div>
                        <button className="btn-secondary" onClick={()=>setShowAllApproved(false)}>Close</button>
                      </div>
                    </div>
                    <div style={{overflowY:'auto', maxHeight:'calc(100vh - 220px)'}}>
                      <div className="admin-list">
                        {displayedApproved.map(s => (
                          <div className="admin-list-row" key={s._id}>
                            <div className="subcard">
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                  <strong>{s.orgName || s.businessName || s.organizationName || s.username}</strong>
                                  <div className="muted">Business #: {s.businessNumber || '—'} • Seller: {s.fullName || s.username}</div>
                                  <div className="muted">Email: {s.businessEmail || s.username || s.email || '—'}</div>
                                </div>
                                <div className="row-actions">
                                  <button onClick={()=>openDeleteConfirm('seller', s._id)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showAllSellers && (
                <div className="overlay-backdrop" onClick={()=>setShowAllSellers(false)}>
                  <div className="overlay-card" onClick={(e)=>e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                      <h3 style={{margin:0}}>All Seller Applications</h3>
                      <div>
                        <button className="btn-secondary" onClick={()=>setShowAllSellers(false)}>Close</button>
                      </div>
                    </div>
                    <div style={{overflowY:'auto', maxHeight:'calc(100vh - 220px)'}}>
                      <div className="admin-list">
                        {displayedSellers.map(s => (
                          <div className="admin-list-row" key={s._id}>
                            <div className="subcard">
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                  <strong>{s.orgName || s.businessName || s.organizationName || s.username}</strong>
                                  <div className="muted">Business #: {s.businessNumber || '—'} • {s.fullName || s.username}</div>
                                  <div className="muted">Email: {s.businessEmail || s.username}</div>
                                  <div style={{marginTop:8}}>{s.orgName && s.orgName !== (s.businessName || '') ? '' : ''}</div>
                                </div>
                                <div className="row-actions">
                                  <button onClick={()=>approveSeller(s._id)}>Approve</button>
                                  <button onClick={()=>openDeleteConfirm('seller', s._id)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Approved Sellers - full width at bottom */}
              <div className="admin-card admin-card-wide" style={{marginTop:18}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Approved Sellers</h3>
                    <p className="muted">Sellers that have been approved and have accounts.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchApprovedSellers}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
                  <input style={{flex:1, minWidth:0}} placeholder="Search by org, name, or id" value={approvedQuery} onChange={e=>setApprovedQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){
                    const q = approvedQuery.trim().toLowerCase();
                    if(q === '') setDisplayedApproved(approvedSellers);
                    else setDisplayedApproved(approvedSellers.filter(s => (
                      (s.orgName||'').toLowerCase().includes(q) ||
                      (s.username||'').toLowerCase().includes(q) ||
                      (s.fullName||'').toLowerCase().includes(q) ||
                      (s._id||'').toLowerCase().includes(q)
                    )));
                    setApprovedHasSearched(true);
                  } }} />
                  <button className="btn-secondary" onClick={() => {
                    const q = approvedQuery.trim().toLowerCase();
                    if(q === '') setDisplayedApproved(approvedSellers);
                    else setDisplayedApproved(approvedSellers.filter(s => (
                      (s.orgName||'').toLowerCase().includes(q) ||
                      (s.username||'').toLowerCase().includes(q) ||
                      (s.fullName||'').toLowerCase().includes(q) ||
                      (s._id||'').toLowerCase().includes(q)
                    )));
                    setApprovedHasSearched(true);
                  }}>Search</button>
                  <button className="btn-secondary" onClick={()=>{ setApprovedQuery(''); setDisplayedApproved(approvedSellers); setApprovedHasSearched(false); }}>Clear</button>
                </div>
                {approvedHasSearched && displayedApproved.length > 0 && (
                  <div style={{marginTop:12}} className="admin-list">
                    {displayedApproved.map(s => (
                      <div className="admin-list-row" key={s._id}>
                        <div className="subcard">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                              <strong>{s.orgName || s.businessName || s.organizationName || s.username}</strong>
                              <div className="muted">Business #: {s.businessNumber || '—'} • Seller: {s.fullName || s.username}</div>
                              <div className="muted">Email: {s.businessEmail || s.username || s.email || '—'} • Id: {s._id}</div>
                            </div>
                            <div className="row-actions">
                              <button onClick={()=>openDeleteConfirm('seller', s._id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginTop:8, display:'flex', justifyContent:'center'}}>
                  <button className="btn-primary" onClick={async ()=>{ await fetchApprovedSellers(); setShowAllApproved(true); }}>View all Approved Sellers</button>
                </div>
                {/* Confirmation modal */}
                {confirmOpen && (
                  <div className="overlay-backdrop" onClick={()=>setConfirmOpen(false)}>
                    <div className="overlay-card" onClick={e=>e.stopPropagation()} style={{maxWidth:560, textAlign:'center'}}>
                      <h3>Are you sure you want to delete?</h3>
                      <p className="muted">This action is permanent and can't be undone.</p>
                      <div style={{display:'flex', justifyContent:'center', gap:12, marginTop:18}}>
                        <button className="btn-secondary" onClick={()=>{ setConfirmOpen(false); setConfirmTarget({ type:null, id:null }); }}>Cancel</button>
                        <button className="btn-primary" onClick={confirmDelete}>Confirm</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}