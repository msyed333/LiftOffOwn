import React, { useState } from 'react';
import './Admin.css';

export default function Admin(){
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [displayedBookings, setDisplayedBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [displayedSellers, setDisplayedSellers] = useState([]);
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

  async function fetchUsers(){
    const url = userQuery ? `http://localhost:9000/admin/users?q=${encodeURIComponent(userQuery)}` : 'http://localhost:9000/admin/users';
    const res = await fetch(url);
    const json = await res.json();
  const list = json.users || [];
  setUsers(list);
  setDisplayedUsers(list);
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

  async function fetchSellers(){
    const url = sellerQuery ? `http://localhost:9000/admin/sellers?q=${encodeURIComponent(sellerQuery)}` : 'http://localhost:9000/admin/sellers';
    const res = await fetch(url);
    const json = await res.json();
    const list = json.sellers || [];
    setSellers(list);
    setDisplayedSellers(list);
  }

  React.useEffect(()=>{ fetchUsers(); fetchBookings(); fetchTickets(); }, []);
  React.useEffect(()=>{ fetchSellers(); }, []);
  React.useEffect(()=>{ fetchFlights(); }, []);

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
    if(!window.confirm('Delete user? This cannot be undone')) return;
    await fetch(`http://localhost:9000/admin/user/${id}`, { method: 'DELETE' });
    fetchUsers();
  }

  async function deleteBooking(id){
    if(!window.confirm('Delete booking?')) return;
    await fetch(`http://localhost:9000/admin/booking/${id}`, { method: 'DELETE' });
    fetchBookings();
  }

  async function deleteSeller(id){
    if(!window.confirm('Delete seller?')) return;
    await fetch(`http://localhost:9000/admin/seller/${id}`, { method: 'DELETE' });
    fetchSellers();
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
                        <div className="subcard" style={{flex:1, minWidth:220}}>
                          <div className="muted">Avg Rating by Airline</div>
                          <div style={{marginTop:8}}>
                            {airlineAverages.slice(0,6).map(a => (
                              <div key={a.airline} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0'}}>
                                <div className="muted">{a.airline}</div>
                                <div style={{fontWeight:700}}>{a.avg} <span className="muted" style={{fontWeight:400}}>({a.count})</span></div>
                              </div>
                            ))}
                            {airlineAverages.length === 0 && <div className="muted">No ratings available</div>}
                          </div>
                        </div>
                        <div className="subcard" style={{flex:1, minWidth:220}}>
                          <div className="muted">Rating Distribution</div>
                          <div style={{marginTop:8}}>
                            {Object.keys(ratingDist).map(k => (
                              <div key={k} style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                                <div style={{width:28}}>{k}★</div>
                                <div className="hist-bar" style={{flex:1}}>
                                  <div className="hist-fill" style={{width: ((ratingDist[k]/maxDist)*100) + '%'}}></div>
                                </div>
                                <div style={{width:40, textAlign:'right'}} className="muted">{ratingDist[k]}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              <div className="admin-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                  <div>
                    <h3>Users</h3>
                    <p className="muted">View and manage registered users.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchUsers}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8}}>
                  <input placeholder="Search by name, username, or id" value={userQuery} onChange={e=>setUserQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') {
                    const q = e.target.value.trim().toLowerCase();
                    if(q === '') setDisplayedUsers(users);
                    else setDisplayedUsers(users.filter(u => (
                      (u.username||'').toLowerCase().includes(q) ||
                      (u.firstName||'').toLowerCase().includes(q) ||
                      (u.lastName||'').toLowerCase().includes(q) ||
                      (u._id||'').toLowerCase().includes(q)
                    )));
                    setUserHasSearched(true);
                  } }} />
                  <button className="btn-secondary" onClick={()=>{
                    const q = userQuery.trim().toLowerCase();
                    if(q === '') setDisplayedUsers(users);
                    else setDisplayedUsers(users.filter(u => (
                      (u.username||'').toLowerCase().includes(q) ||
                      (u.firstName||'').toLowerCase().includes(q) ||
                      (u.lastName||'').toLowerCase().includes(q) ||
                      (u._id||'').toLowerCase().includes(q)
                    )));
                    setUserHasSearched(true);
                  }}>Search</button>
                  <button className="btn-secondary" onClick={()=>{ setUserQuery(''); setDisplayedUsers(users); setUserHasSearched(false); }}>Clear</button>
                </div>
                {/* Render search results in-card (above the View all button) */}
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
                              <button onClick={()=>deleteUser(u._id)}>Delete</button>
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
                {/* Users inline list removed; use View all users to see full list in overlay */}
              </div>
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
                  <input placeholder="Search by code, name, or email" value={bookingQuery} onChange={e=>setBookingQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') {
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
                {/* Render search results in-card (above the View all button) */}
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
                              <button onClick={()=>deleteBooking(b._id)}>Delete</button>
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
                {/* Bookings inline list removed; use View all bookings to see full list in overlay */}
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
                                  <button onClick={()=>deleteUser(u._id)}>Delete</button>
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
                                  <button onClick={()=>deleteBooking(b._id)}>Delete</button>
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
                    <h3>Sellers</h3>
                    <p className="muted">Seller accounts and listings.</p>
                  </div>
                  <div>
                    <button className="btn-secondary" onClick={fetchSellers}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8}}>
                  <input placeholder="Search by name, username, or id" value={sellerQuery} onChange={e=>setSellerQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') {
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
                              <strong>{s.username || (s.firstName+' '+(s.lastName||''))}</strong>
                              <div className="muted">Id: {s._id} • Listings: {s.listings ? s.listings.length : 0}</div>
                            </div>
                            <div className="row-actions">
                              <button onClick={()=>deleteSeller(s._id)}>Delete</button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

