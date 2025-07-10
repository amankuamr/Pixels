// @ts-nocheck
const { useState, useEffect } = React;

// Firebase CDN
const firebaseConfig = {
  apiKey: "AIzaSyD7RGBJ03DP6sC4nbxNdINgZC6oGH_XPFI",
  authDomain: "taskzen-wb02e.firebaseapp.com",
  projectId: "taskzen-wb02e",
  storageBucket: "taskzen-wb02e.firebasestorage.app",
  messagingSenderId: "752665383909",
  appId: "1:752665383909:web:501561c6d81b27f830950c"
};

// Firestore CDN
const firestoreScriptUrl = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';

const rootDiv = document.getElementById('root');
if (!window.firebase) {
  rootDiv.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:18px;color:#888;">Loading Firebase...</div>';
  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
  script.onload = () => {
    const authScript = document.createElement('script');
    authScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
    authScript.onload = () => {
      const firestoreScript = document.createElement('script');
      firestoreScript.src = firestoreScriptUrl;
      firestoreScript.onload = () => {
        try {
          window.firebase.initializeApp(firebaseConfig);
          renderApp();
        } catch (e) {
          rootDiv.innerHTML = '<div style="color:#e74c3c;text-align:center;padding:32px">Failed to initialize Firebase.<br>'+e.message+'</div>';
        }
      };
      firestoreScript.onerror = () => {
        rootDiv.innerHTML = '<div style="color:#e74c3c;text-align:center;padding:32px">Failed to load Firestore script.</div>';
      };
      document.body.appendChild(firestoreScript);
    };
    authScript.onerror = () => {
      rootDiv.innerHTML = '<div style="color:#e74c3c;text-align:center;padding:32px">Failed to load Firebase Auth script.</div>';
    };
    document.body.appendChild(authScript);
  };
  script.onerror = () => {
    rootDiv.innerHTML = '<div style="color:#e74c3c;text-align:center;padding:32px">Failed to load Firebase script.</div>';
  };
  document.body.appendChild(script);
} else {
  renderApp();
}

function renderApp() {
  const auth = firebase.auth();

  // Add People Page: shows all users as cards
  function AddPeoplePage({ user }) {
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [tab, setTab] = useState('follow'); // 'follow' or 'requests'
    const [page, setPage] = useState('add_people');
    const db = window.firebase.firestore();

    // Fetch all users for Follow tab
    useEffect(() => {
      db.collection('users').get().then(snapshot => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().displayName || doc.data().username || doc.data().email || doc.id,
          username: doc.data().username || (doc.data().email ? doc.data().email.split('@')[0] : ''),
          photoURL: doc.data().photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
          requests: doc.data().requests || [],
        }));
        setUsers(usersList);
      });
    }, []);

    // Fetch requests for current user for Requests tab (real-time)
    useEffect(() => {
      const unsubscribe = db.collection('users').doc(user.uid).onSnapshot(doc => {
        const reqs = (doc.exists && doc.data().requests) ? doc.data().requests : [];
        setRequests(reqs);
      });
      return unsubscribe;
    }, [user.uid]);

    return (
      <div>
        {/* Minimal header for Add People page */}
        <div className="header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{
            fontFamily:'cursive', fontWeight:700, fontSize:26, letterSpacing:1,
            color: '#222',
            filter: 'drop-shadow(0 2px 8px #ececec)'
          }}>Pixels</span>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button onClick={() => window.location.href = 'index.html'} style={{background:'none', border:'none', cursor:'pointer'}} title="Back to Home">
              <svg className="icon" viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M15 18l-6-6 6-6" stroke="#6c47ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div className="main-content" style={{ padding: '24px 16px', maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#6c47ff', marginBottom: 24 }}>Add People</h2>
          {/* Tab Switcher */}
          <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:24}}>
            <button
              onClick={() => setTab('follow')}
              style={{
                padding:'10px 24px',
                borderRadius:8,
                border: tab==='follow' ? '2px solid #6c47ff' : '2px solid #ede4ff',
                background: tab==='follow' ? '#f5f3fa' : '#fff',
                color: tab==='follow' ? '#6c47ff' : '#888',
                fontWeight:600,
                fontSize:16,
                cursor:'pointer',
                outline:'none'
              }}
            >
              Follow
            </button>
            <button
              onClick={() => setTab('requests')}
              style={{
                padding:'10px 24px',
                borderRadius:8,
                border: tab==='requests' ? '2px solid #6c47ff' : '2px solid #ede4ff',
                background: tab==='requests' ? '#f5f3fa' : '#fff',
                color: tab==='requests' ? '#6c47ff' : '#888',
                fontWeight:600,
                fontSize:16,
                cursor:'pointer',
                outline:'none'
              }}
            >
              Requests
            </button>
          </div>
          {/* Tab Content */}
          {tab === 'follow' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888' }}>No users found.</div>
              ) : (
                users.filter(u =>
                  u.id !== user.uid &&
                  !(u.following && u.following.includes(user.uid))
                ).map(u => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#fff',
                      borderRadius: 12,
                      padding: 14,
                      boxShadow: '0 2px 8px #ececec',
                      gap: 16,
                      minHeight: 70
                    }}
                  >
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede4ff' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 18, color: '#6c47ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                      <div style={{ fontSize: 14, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{u.username}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 8 }}>
                      {u.requests && u.requests.includes(user.uid) ? (
                        <div style={{display:'flex',gap:8}}>
                          <button
                            disabled
                            style={{
                              padding: '8px 18px',
                              borderRadius: 8,
                              background: '#ede4ff',
                              color: '#6c47ff',
                              border: 'none',
                              fontWeight: 600,
                              minWidth: 90
                            }}
                          >
                            Requested
                          </button>
                          <button
                            style={{
                              padding: '8px 18px',
                              borderRadius: 8,
                              background: '#fff',
                              color: '#e74c3c',
                              border: '1.5px solid #e74c3c',
                              fontWeight: 600,
                              minWidth: 90,
                              cursor: 'pointer'
                            }}
                            onClick={async () => {
                              await db.collection('users').doc(u.id).update({
                                requests: window.firebase.firestore.FieldValue.arrayRemove(user.uid)
                              });
                              setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, requests: (usr.requests || []).filter(rid => rid !== user.uid) } : usr));
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            await db.collection('users').doc(u.id).update({
                              requests: window.firebase.firestore.FieldValue.arrayUnion(user.uid)
                            });
                            // Update local state for immediate feedback
                            setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, requests: [...(usr.requests || []), user.uid] } : usr));
                          }}
                          style={{
                            padding: '8px 18px',
                            borderRadius: 8,
                            background: 'linear-gradient(135deg,#a084e8 0%,#6c47ff 100%)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minWidth: 90
                          }}
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888' }}>No requests found.</div>
              ) : (
                requests.map(req => {
                  // Find user info for each request
                  const reqUser = users.find(u => u.id === req);
                  if (!reqUser) return null;
                  return (
                    <div
                      key={reqUser.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                        borderRadius: 12,
                        padding: 14,
                        boxShadow: '0 2px 8px #ececec',
                        gap: 16,
                        minHeight: 70
                      }}
                    >
                      <img
                        src={reqUser.photoURL}
                        alt={reqUser.name}
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede4ff' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 18, color: '#6c47ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reqUser.name}</div>
                        <div style={{ fontSize: 14, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{reqUser.username}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* Accept (tick) button */}
                        <button
                          title="Accept"
                          onClick={async () => {
                            // Remove from requests and add to followers/following
                            await db.collection('users').doc(user.uid).update({
                              requests: window.firebase.firestore.FieldValue.arrayRemove(reqUser.id),
                              followers: window.firebase.firestore.FieldValue.arrayUnion(reqUser.id)
                            });
                            await db.collection('users').doc(reqUser.id).update({
                              following: window.firebase.firestore.FieldValue.arrayUnion(user.uid)
                            });
                            setRequests(prev => prev.filter(r => r !== reqUser.id));
                          }}
                          style={{
                            background: '#27ae60',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 18
                          }}
                        >
                          ✓
                        </button>
                        {/* Reject (cross) button */}
                        <button
                          title="Reject"
                          onClick={async () => {
                            await db.collection('users').doc(user.uid).update({
                              requests: window.firebase.firestore.FieldValue.arrayRemove(reqUser.id)
                            });
                            setRequests(prev => prev.filter(r => r !== reqUser.id));
                          }}
                          style={{
                            background: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 18
                          }}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        </div>
    );
  }

  function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [showCreate, setShowCreate] = useState(false);
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const db = window.firebase.firestore();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(u => {
        if (u && u.uid) {
          // Attach location from localStorage
          const loc = localStorage.getItem('user_location_' + u.uid) || '';
          u.location = loc;
        }
        setUser(u);
        setLoading(false);
      });
      return unsubscribe;
    }, []);

    // Fetch posts from Firestore
    useEffect(() => {
      setPostsLoading(true);
      const unsubscribe = db.collection('posts').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(fetchedPosts);
        setPostsLoading(false);
      });
      return unsubscribe;
    }, []);

    if (loading) return <div className="auth-container"><div>Loading...</div></div>;
    if (!user) return <Auth />;

    // Save new post to Firestore
    async function handleCreatePost(newPost) {
      try {
        await db.collection('posts').add({
          ...newPost,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        });
        setShowCreate(false);
      } catch (err) {
        alert('Failed to create post: ' + err.message);
      }
    }

    return (
      <div>
        <Header onSignOut={() => auth.signOut()} user={user} />
        <div className="main-content">
          {page === 'home' && <HomePage user={user} posts={posts} loading={postsLoading} />}
          {page === 'profile' && <ProfilePage user={user} />}
          {page === 'search' && <SearchPage />}
          {page === 'activity' && <ActivityPage user={user} />}
        </div>
        <NavBar page={page} setPage={setPage} onPlus={() => setShowCreate(true)} />
        {showCreate && <CreatePostModal user={user} onClose={() => setShowCreate(false)} onCreate={handleCreatePost} />}
      </div>
    );
  }

  function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMode, setResetMode] = useState(false);
    const [resetMsg, setResetMsg] = useState('');

    const handleAuth = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const db = window.firebase.firestore();
        if (isSignUp) {
          const userCred = await auth.createUserWithEmailAndPassword(email, password);
          await userCred.user.updateProfile({ displayName: name });
          // Store username and name in Firestore
          const username = email.split('@')[0];
          await db.collection('users').doc(userCred.user.uid).set({ username, name, email }, { merge: true });
          // Store location in localStorage (or you could use Firestore for real apps)
          localStorage.setItem('user_location_' + userCred.user.uid, location);
          window.location.reload();
        } else {
          const userCred = await auth.signInWithEmailAndPassword(email, password);
          // Ensure username and name are in Firestore
          const username = email.split('@')[0];
          if (userCred.user.displayName) {
            await db.collection('users').doc(userCred.user.uid).set({ username, name: userCred.user.displayName, email }, { merge: true });
          } else {
            await db.collection('users').doc(userCred.user.uid).set({ username, email }, { merge: true });
          }
          window.location.reload();
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    const handleResetPassword = async (e) => {
      e.preventDefault();
      setResetMsg('');
      setError('');
      setLoading(true);
      try {
        await auth.sendPasswordResetEmail(email);
        setResetMsg('Password reset email sent! Check your inbox.');
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 style={{textAlign:'center', fontFamily:'cursive', marginBottom: 24, color:'#262626'}}>Instagram</h2>
          {!resetMode ? (
            <>
              <form onSubmit={handleAuth}>
                {isSignUp && (
                  <>
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required={isSignUp} />
                    <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required={isSignUp} />
                  </>
                )}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="submit" disabled={loading}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                {error && <div style={{color:'#e74c3c', marginTop:8, fontSize:14}}>{error}</div>}
              </form>
              <div style={{marginTop:10, textAlign:'right'}}>
                {!isSignUp && <span style={{color:'#6c47ff',cursor:'pointer',fontSize:14}} onClick={()=>{setResetMode(true);setResetMsg('');setError('');}}>Forgot Password?</span>}
              </div>
            </>
          ) : (
            <form onSubmit={handleResetPassword}>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" disabled={loading}>Send Reset Email</button>
              {resetMsg && <div style={{color:'#27ae60', marginTop:8, fontSize:14}}>{resetMsg}</div>}
              {error && <div style={{color:'#e74c3c', marginTop:8, fontSize:14}}>{error}</div>}
              <div style={{marginTop:10, textAlign:'right'}}>
                <span style={{color:'#6c47ff',cursor:'pointer',fontSize:14}} onClick={()=>{setResetMode(false);setResetMsg('');setError('');}}>Back to Sign In</span>
              </div>
            </form>
          )}
          <div className="auth-switch" onClick={() => setIsSignUp(s => !s)}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </div>
        </div>
      </div>
    );
  }

  function Header({ onSignOut, user }) {
    return (
      <div className="header">
        <span style={{
          fontFamily:'cursive', fontWeight:700, fontSize:26, letterSpacing:1,
          color: '#222',
          filter: 'drop-shadow(0 2px 8px #ececec)'
        }}>Pixels</span>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <button onClick={() => window.location.href = 'add_people.html'} style={{background:'none', border:'none', cursor:'pointer'}} title="Add Friends">
            <img src="images/navbar/user-add.png" alt="Add Friends" style={{width: 24, height: 24, objectFit: 'contain', display: 'block'}} />
          </button>
          <button onClick={onSignOut} style={{background:'none', border:'none', cursor:'pointer'}} title="Sign Out">
            <img src="images/navbar/sign-out-alt.png" alt="Sign Out" style={{width: 24, height: 24, objectFit: 'contain', display: 'block', filter: 'invert(18%) sepia(99%) saturate(7492%) hue-rotate(-7deg) brightness(97%) contrast(119%)'}} />
          </button>
        </div>
      </div>
    );
  }

  function NavBar({ page, setPage, onPlus }) {
    return (
      <div className="navbar">
        <span onClick={() => setPage('home')} title="Home">
          <img 
            src={page==='home' ? "images/navbar/homeselected.png" : "images/navbar/home.png"} 
            alt="Home" 
            className={`icon home-icon${page==='home'?' active':''}`} 
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto', filter: page==='home' ? 'drop-shadow(0 0 4px #6c47ff)' : 'none', transform: page==='home' ? 'scale(1.15)' : 'none', transition: 'transform 0.18s' }}
          />
        </span>
        <span onClick={() => setPage('search')} title="Search">
          <img
            src={page==='search' ? "images/navbar/searchselected.png" : "images/navbar/search.png"}
            alt="Search"
            className={`icon home-icon search-icon${page==='search'?' active':''}`}
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto', filter: page==='search' ? 'drop-shadow(0 0 4px #6c47ff)' : 'none' }}
          />
        </span>
        <span className="plus-icon-wrapper" title="Create" onClick={onPlus}>
          <svg className="plus-icon" viewBox="0 0 56 56" width="56" height="56" fill="none" style={{display:'block',margin:'auto'}}>
            <path d="M28 16v24M16 28h24" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
          </svg>
        </span>
        <span onClick={() => setPage('activity')} title="Activity">
          <img
            src={page==='activity' ? "images/navbar/heartselected.png" : "images/navbar/heart.png"}
            alt="Activity"
            className={`icon home-icon heart-icon${page==='activity'?' active':''}`}
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto', filter: page==='activity' ? 'drop-shadow(0 0 4px #6c47ff)' : 'none' }}
          />
        </span>
        <span onClick={() => setPage('profile')} title="Profile">
          <img
            src={page==='profile' ? "images/navbar/userselected.png" : "images/navbar/user.png"}
            alt="Profile"
            className={`icon home-icon user-icon${page==='profile'?' active':''}`}
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto', filter: page==='profile' ? 'drop-shadow(0 0 4px #6c47ff)' : 'none' }}
          />
        </span>
      </div>
    );
  }

  // Comment Modal as bottom sheet (move outside HomePage)
function CommentModal({ post, onClose, onCommentAdded }) {
  const isMobile = window.innerWidth <= 600;
  // Lock background scroll when modal is open
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  // Assume nav bar is about 56px tall, so leave space for it
  const navBarHeight = 56;
  const modalStyle = isMobile
    ? {
        position: 'fixed',
        left: 0,
        top: 'auto',
        bottom: 0,
        width: '100vw',
        height: '70vh',
        background: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        boxShadow: '0 -8px 32px 0 rgba(96, 71, 255, 0.25), 0 2px 8px 0 rgba(0,0,0,0.10)',
        zIndex: 2000,
        animation: 'slideUpComment 0.35s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        position: 'fixed',
        left: '50%',
        top: 'auto',
        bottom: 0,
        width: 430,
        maxWidth: '100vw',
        transform: 'translateX(-50%)',
        height: '70vh',
        background: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        boxShadow: '0 -8px 32px #a084e822',
        zIndex: 2000,
        animation: 'slideUpComment 0.35s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
      };

  const [comments, setComments] = React.useState([]);
  const [newComment, setNewComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const user = window.firebase.auth().currentUser;
  const db = window.firebase.firestore();

  // Fetch comments in real time
  React.useEffect(() => {
    const unsubscribe = db
      .collection("posts")
      .doc(post.id)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .onSnapshot((snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(fetched);
        setLoading(false);
        if (onCommentAdded) onCommentAdded(post.id, fetched.length);
      });
    return unsubscribe;
  }, [post.id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data() || {};
    await db
      .collection("posts")
      .doc(post.id)
      .collection("comments")
      .add({
        text: newComment,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
        username: userData.username || user.email.split("@")[0],
        name: userData.name || user.displayName || user.email.split("@")[0],
        photoURL: userData.photoURL || user.photoURL || "https://randomuser.me/api/portraits/men/32.jpg",
      });
    setNewComment("");
    if (onCommentAdded) {
      const snapshot = await db.collection("posts").doc(post.id).collection("comments").get();
      onCommentAdded(post.id, snapshot.size);
    }
  }

  return (
    <div style={modalStyle}>
      <button onClick={onClose} style={{alignSelf:'flex-end',margin:'12px 18px 0 0',background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#a084e8'}} title="Close">×</button>
      <div style={{padding:'0 24px',flex:1,display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{textAlign:'center',fontWeight:700,fontSize:18,letterSpacing:1,color:'#6c47ff',margin:'12px 0 18px 0'}}>Comments</div>
        <div style={{flex:1,overflowY:'auto',paddingBottom:18}}>
          {loading ? (
            <div style={{color:'#888',textAlign:'center',marginTop:24}}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div style={{color:'#888',textAlign:'center',marginTop:24}}>No comments yet.</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:18}}>
                <img src={c.photoURL} alt={c.username} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid #ede4ff'}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15}}>{c.name} <span style={{color:'#888',fontWeight:400,fontSize:13}}>@{c.username}</span></div>
                  <div style={{color:'#222',fontSize:15,marginTop:2}}>{c.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Add comment input fixed at bottom as flex child, with margin for nav bar */}
        <form onSubmit={handleAddComment} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 0 8px 0',borderTop:'1px solid #eee',background:'#fff',marginBottom:navBarHeight}}>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{flex:1,padding:10,borderRadius:999,border:'2px solid #111',background:'transparent',color:'#111',fontSize:15,outline:'none'}}
          />
          <button type="submit" style={{padding:0,border:'none',background:'none',display:'flex',alignItems:'center',justifyContent:'center',height:40,width:40,cursor:'pointer'}}>
            <img src="images/navbar/send.png" alt="Send" style={{width:28,height:28,objectFit:'contain',display:'block'}} />
          </button>
        </form>
      </div>
    </div>
  );
}

function HomePage({ user, posts, loading }) {
  const db = window.firebase.firestore();
  const [commentModalPost, setCommentModalPost] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [menuOpenIdx, setMenuOpenIdx] = useState(null);

  // Listen for comment counts for all posts in real time
  React.useEffect(() => {
    if (!posts || posts.length === 0) return;
    const db = window.firebase.firestore();
    const unsubscribes = posts.map(post =>
      db.collection('posts').doc(post.id).collection('comments')
        .onSnapshot(snapshot => {
          setCommentCounts(prev => ({ ...prev, [post.id]: snapshot.size }));
        })
    );
    return () => unsubscribes.forEach(unsub => unsub && unsub());
  }, [posts]);
  const [menuPosition, setMenuPosition] = useState({top: 0, left: 0});
  // No isMobile check, always allow modal
  // Add keyframes for slide up
  React.useEffect(() => {
    if (!document.getElementById('slideUpCommentKeyframes')) {
      const style = document.createElement('style');
      style.id = 'slideUpCommentKeyframes';
      style.innerHTML = `@keyframes slideUpComment { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
      document.head.appendChild(style);
    }
  }, []);
  if (loading) return <div style={{padding:32, textAlign:'center', color:'#888'}}>Loading feed...</div>;
  if (!posts.length) return <div style={{padding:32, textAlign:'center', color:'#888'}}>No posts yet.</div>;

  // Like/unlike logic
  async function handleLike(post) {
    const userId = user.uid;
    const postRef = db.collection('posts').doc(post.id);
    const alreadyLiked = post.likesArr && post.likesArr.includes(userId);
    if (alreadyLiked) {
      // Unlike
      await postRef.update({
        likesArr: window.firebase.firestore.FieldValue.arrayRemove(userId),
        likes: (post.likes || 0) - 1
      });
    } else {
      // Like
      await postRef.update({
        likesArr: window.firebase.firestore.FieldValue.arrayUnion(userId),
        likes: (post.likes || 0) + 1
      });
    }
  }

  // Helper to render dropdown as a portal
  function DropdownPortal({ children }) {
    React.useEffect(() => {
      // Prevent scrolling when menu is open
      document.body.style.overflow = menuOpenIdx !== null ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }, [menuOpenIdx]);
    return ReactDOM.createPortal(children, document.body);
  }
  // Comments count logic removed

  return (
    <div>
      {posts.map((post, idx) => {
        const liked = post.likesArr && post.likesArr.includes(user.uid);
        const isOwner = post.userid === (user.email ? user.email.split('@')[0] : user.uid);
        return (
          <div className="post" key={post.id} style={{position:'relative', overflow:'visible', zIndex:0}}>
            <div className="post-header" style={{justifyContent:'space-between', position:'relative', zIndex:0}}>
              <div style={{display:'flex',alignItems:'center'}}>
                <img src={post.avatar} alt={post.username} />
                <div>
                  <div style={{fontWeight:600, fontSize:17, marginBottom:2}}>{post.username}</div>
                  <div style={{color:'#888',fontWeight:400,fontSize:13,marginBottom:2}}>@{post.userid}</div>
                  <div style={{color:'#888',fontSize:13,marginTop:1}}>{post.location}</div>
                </div>
              </div>
              {/* 3-dot menu */}
              <div style={{position:'absolute',top:'50%',right:'12px',transform:'translateY(-50%)'}}>
                <button
                  onClick={e => {
                    setMenuOpenIdx(menuOpenIdx === idx ? null : idx);
                    if (menuOpenIdx !== idx) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: rect.bottom + 8,
                        left: rect.right - 140 // width of dropdown
                      });
                    }
                  }}
                  style={{background:'none',border:'none',cursor:'pointer',padding:8,display:'flex',alignItems:'center',justifyContent:'center'}}
                  title="Options"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
              {menuOpenIdx === idx && (
                <DropdownPortal>
                  <div style={{position:'fixed',top:menuPosition.top,left:menuPosition.left,width:140,background:'#fff',border:'1px solid #eee',borderRadius:8,boxShadow:'0 2px 8px #ececec',zIndex:99999}}>
                    {isOwner && (
                      <div
                        onClick={async () => {
                          await db.collection('posts').doc(post.id).delete();
                          setMenuOpenIdx(null);
                        }}
                        style={{padding:'8px 18px',cursor:'pointer',color:'#e74c3c',fontWeight:500}}
                      >
                        Delete
                      </div>
                    )}
                  </div>
                </DropdownPortal>
              )}
            </div>
            {post.type === 'picture' && post.image && (
              <img className="post-image" src={post.image} alt="post" />
            )}
            {post.type === 'text' && post.text && (
              <div className="post-caption" style={{fontSize:18,margin:'24px 0',textAlign:'center',color:'#6c47ff',fontWeight:600}}>{post.text}</div>
            )}
            <div className="post-divider"></div>
            <div className="post-content">
              {post.type === 'picture' && <div className="post-caption">{post.caption}</div>}
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span className="post-tag" key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
            <div className="post-actions" style={{display:'flex',alignItems:'center',gap:18}}>
              <button className="post-action-btn modern-action" title={liked ? "Unlike" : "Like"} onClick={() => handleLike(post)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',boxShadow:'none',borderRadius:0}}>
                <img 
                src={liked ? "images/navbar/heartred.png" : "images/navbar/heart.png"} 
                alt={liked ? "Unlike" : "Like"} 
                style={{ width: 22, height: 22, objectFit: 'contain', display: 'block', filter: liked ? undefined : 'grayscale(1) brightness(1.5)' }}
                />
                <span style={{fontSize:15,color:'#888',fontWeight:500}}>{post.likes ? post.likes : 0}</span>
              </button>
              <button className="post-action-btn modern-action" title="Comment" onClick={() => {
                setCommentModalPost(post);
              }} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',boxShadow:'none',borderRadius:0}}>
                <img 
                  src="images/navbar/comment.png" 
                  alt="Comment" 
                  style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }}
                />
                <span style={{fontSize:15,color:'#888',fontWeight:500}}>{commentCounts[post.id] || 0}</span>
              </button>
            </div>
          </div>
        );
      })}
      {commentModalPost && <CommentModal post={commentModalPost} onClose={() => setCommentModalPost(null)} onCommentAdded={(postId, count) => setCommentCounts(prev => ({ ...prev, [postId]: count }))} />}
    </div>
  );
}

  function ProfilePage({ user }) {
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const [photoURL, setPhotoURL] = useState(user.photoURL || "https://randomuser.me/api/portraits/men/32.jpg");
    const [bio, setBio] = useState('');
    const [bioInput, setBioInput] = useState('');
    const [editingBio, setEditingBio] = useState(false);
    const db = window.firebase.firestore();

    // Fetch bio from Firestore
    React.useEffect(() => {
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists && doc.data().bio) setBio(doc.data().bio);
      });
    }, [user.uid]);

    async function handlePhotoChange(e) {
      setPhotoError('');
      setPhotoUploading(true);
      const file = e.target.files[0];
      if (!file) {
        setPhotoUploading(false);
        return;
      }
      // Cloudinary config
      const cloudName = 'dgyqgv15p';
      const uploadPreset = 'pixels';
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      try {
        const res = await fetch(url, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error('Upload failed');
        // Update Firebase Auth profile
        await user.updateProfile({ photoURL: data.secure_url });
        setPhotoURL(data.secure_url);
        // Store in Firestore user doc
        await db.collection('users').doc(user.uid).set({ photoURL: data.secure_url }, { merge: true });
        // Update all posts by this user with new avatar
        const postsSnapshot = await db.collection('posts').where('userid', '==', user.email.split('@')[0]).get();
        const batch = db.batch();
        postsSnapshot.forEach(doc => {
          batch.update(doc.ref, { avatar: data.secure_url });
        });
        await batch.commit();
      } catch (err) {
        setPhotoError('Failed to upload photo.');
      }
      setPhotoUploading(false);
    }

    async function handleBioSave() {
      setBio(bioInput);
      setEditingBio(false);
      // Store bio in Firestore
      await db.collection('users').doc(user.uid).set({ bio: bioInput }, { merge: true });
      // Update all posts by this user with new bio
      const postsSnapshot = await db.collection('posts').where('userid', '==', user.email.split('@')[0]).get();
      const batch = db.batch();
      postsSnapshot.forEach(doc => {
        batch.update(doc.ref, { bio: bioInput });
      });
      await batch.commit();
    }

    // Fetch followers and following from Firestore
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [postsCount, setPostsCount] = useState(0);
    useEffect(() => {
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
          setFollowers(doc.data().followers || []);
          setFollowing(doc.data().following || []);
        }
      });
      db.collection('posts').where('userid', '==', user.email.split('@')[0]).get().then(snapshot => {
        setPostsCount(snapshot.size);
      });
    }, [user.uid, user.email]);

    return (
      <div style={{padding:'24px 16px', maxWidth: 430, margin: '0 auto'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:18}}>
          <div style={{position:'relative', marginRight:20}}>
            <img src={photoURL} alt="avatar" style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'3px solid #ede4ff',boxShadow:'0 2px 8px #a084e822'}} />
            <label htmlFor="profile-photo-input" style={{position:'absolute',bottom:0,right:0,background:'#fff',color:'#6c47ff',borderRadius:'50%',padding:0,cursor:'pointer',boxShadow:'0 2px 8px #a084e822',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #6c47ff'}} title="Edit profile photo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c47ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              <input id="profile-photo-input" type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoChange} disabled={photoUploading} />
            </label>
            {photoUploading && <div style={{position:'absolute',top:0,left:0,width:80,height:80,background:'rgba(255,255,255,0.7)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#6c47ff'}}>Uploading...</div>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:22,marginBottom:2}}>{user.displayName || user.email.split('@')[0]}</div>
            <div style={{color:'#888',fontSize:15,marginBottom:2}}>{user.email}</div>
            {user.location && <div style={{color:'#555',fontSize:15,marginBottom:2}}>{user.location}</div>}
            <div style={{display:'flex',gap:18,marginTop:10}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:700,fontSize:18}}>{postsCount}</div>
                <div style={{color:'#888',fontSize:13}}>Posts</div>
              </div>
              <div style={{textAlign:'center', cursor:'pointer'}} onClick={() => window.location.href = 'followers.html'}>
              <div style={{fontWeight:700,fontSize:18}}>{followers.length}</div>
              <div style={{color:'#888',fontSize:13}}>Followers</div>
              </div>
              <div style={{textAlign:'center', cursor:'pointer'}} onClick={() => window.location.href = 'following.html'}>
              <div style={{fontWeight:700,fontSize:18}}>{following.length}</div>
              <div style={{color:'#888',fontSize:13}}>Following</div>
              </div>
            </div>
          </div>
        </div>
        {photoError && <div style={{color:'#e74c3c',marginBottom:10}}>{photoError}</div>}
        <div style={{marginTop:18,marginBottom:10}}>
          <div style={{fontWeight:600,fontSize:16,marginBottom:6}}>Bio</div>
          {editingBio ? (
            <div style={{display:'flex',gap:8}}>
              <input
                type="text"
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                placeholder="Add your bio..."
                style={{flex:1,padding:10,borderRadius:8,border:'1px solid #a084e8',background:'#f5f3fa'}}
              />
              <button onClick={handleBioSave} style={{padding:'10px 16px',borderRadius:8,background:'linear-gradient(135deg,#a084e8 0%,#6c47ff 100%)',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}}>Save</button>
            </div>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{color: bio ? '#222' : '#888',fontSize:15}}>{bio || 'No bio added.'}</div>
              <button onClick={() => {setEditingBio(true);setBioInput(bio);}} style={{padding:'4px 12px',borderRadius:7,background:'#ede4ff',color:'#6c47ff',border:'none',fontWeight:600,cursor:'pointer',fontSize:14}}>Edit</button>
            </div>
          )}
        </div>
        <div style={{marginTop:24, color:'#888',fontSize:15}}>All your account information is shown above. More features coming soon!</div>
      </div>
    );
  }

  function SearchPage() {
    return (
      <div style={{padding:'24px 16px',textAlign:'center',color:'#888'}}>Search feature coming soon!</div>
    );
  }

  function ActivityPage({ user }) {
    const [likeEvents, setLikeEvents] = useState([]);
    const db = window.firebase.firestore();
    useEffect(() => {
      async function fetchLikes() {
        const postsSnapshot = await db.collection('posts').get();
        const usersSnapshot = await db.collection('users').get();
        const usersMap = {};
        usersSnapshot.forEach(doc => {
          usersMap[doc.id] = {
            name: doc.data().name || doc.data().displayName || doc.data().username || doc.data().email || doc.id,
            photoURL: doc.data().photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
          };
        });
        const events = [];
        postsSnapshot.forEach(postDoc => {
          const post = postDoc.data();
          // Only show activity for posts created by the current user
          if (post.userid === (user.email ? user.email.split('@')[0] : user.uid)) {
            if (post.likesArr && post.likesArr.length > 0) {
              post.likesArr.forEach(uid => {
                // Don't show if you liked your own post
                if (uid !== user.uid) {
                  const liker = usersMap[uid] || { name: uid, photoURL: 'https://randomuser.me/api/portraits/men/32.jpg' };
                  events.push({
                    postId: postDoc.id,
                    post,
                    likerId: uid,
                    likerName: liker.name,
                    likerPhoto: liker.photoURL
                  });
                }
              });
            }
          }
        });
        setLikeEvents(events);
      }
      fetchLikes();
    }, [user]);

    // Delete like event handler
    async function handleDeleteLike(postId, likerId) {
      const db = window.firebase.firestore();
      const postRef = db.collection('posts').doc(postId);
      await postRef.update({
        likesArr: window.firebase.firestore.FieldValue.arrayRemove(likerId),
        likes: window.firebase.firestore.FieldValue.increment(-1)
      });
      setLikeEvents(prev => prev.filter(e => !(e.postId === postId && e.likerId === likerId)));
    }

    // 3-dots menu state
    const [menuOpenIdx, setMenuOpenIdx] = React.useState(null);

    return (
      <div style={{padding:'24px 16px'}}>
        {likeEvents.length === 0 ? (
          <div style={{textAlign:'center',color:'#888'}}>No likes yet.</div>
        ) : (
          likeEvents.map(({post, likerName, likerPhoto, likerId, postId}, idx) => (
            <div key={postId + '-' + likerId + '-' + idx} style={{marginBottom:18,background:'#fff',borderRadius:12,padding:14,boxShadow:'0 2px 8px #ececec',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <img src={likerPhoto} alt={likerName} style={{width:38,height:38,borderRadius:'50%',objectFit:'cover',border:'2px solid #ede4ff'}} />
                <div>
                  <span style={{color:'#6c47ff',fontWeight:600}}>{likerName}</span> <span style={{color:'#888'}}>liked your post</span>
                  {post.caption ? <>: <span style={{color:'#222'}}>{post.caption}</span></> : post.text ? <>: <span style={{color:'#222'}}>{post.text}</span></> : null}
                </div>
              </div>
              <div style={{position:'relative'}}>
                <button onClick={()=>setMenuOpenIdx(menuOpenIdx === idx ? null : idx)} style={{background:'none',border:'none',cursor:'pointer',padding:4}} title="Options">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
                {menuOpenIdx === idx && (
                  <div style={{position:'absolute',top:28,right:0,background:'#fff',border:'1px solid #eee',borderRadius:8,boxShadow:'0 2px 8px #ececec',zIndex:10}}>
                    <div onClick={()=>{handleDeleteLike(postId, likerId);setMenuOpenIdx(null);}} style={{padding:'8px 18px',cursor:'pointer',color:'#e74c3c',fontWeight:500}}>Delete</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // CreatePostModal component
  function CreatePostModal({ user, onClose, onCreate }) {
    const [step, setStep] = useState(0); // 0: choose type, 1: content, 2: tags
    const [type, setType] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    function handleTypeSelect(t) {
      setType(t);
      setStep(1);
    }

    function handleImageChange(e) {
      const file = e.target.files[0];
      if (file) {
        setImage(file);
        const reader = new FileReader();
        reader.onload = ev => setImageUrl(ev.target.result);
        reader.readAsDataURL(file);
      }
    }

    async function handleCreate() {
      setCreating(true);
      setError('');
      if (type === 'picture') {
        if (!image) {
          setError('Please select an image.');
          setCreating(false);
          return;
        }
        // Cloudinary config
        const cloudName = 'dgyqgv15p'; // Cloudinary cloud name
        const uploadPreset = 'pixels'; // Unsigned upload preset
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', uploadPreset);
        try {
          const res = await fetch(url, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (!data.secure_url) {
            setError('Image upload failed.');
            setCreating(false);
            return;
          }
          const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
          const newPost = {
            username: user.displayName || user.email.split('@')[0],
            userid: user.email.split('@')[0],
            location: user.location || '',
            avatar: user.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
            type,
            image: data.secure_url,
            caption,
            tags: tagArr,
            likes: 0,
          };
          onCreate(newPost);
        } catch (err) {
          setError('Image upload failed.');
        }
        setCreating(false);
      } else if (type === 'text') {
        if (!text.trim()) {
          setError('Please enter some text.');
          setCreating(false);
          return;
        }
        const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
        const newPost = {
          username: user.displayName || user.email.split('@')[0],
          userid: user.email.split('@')[0],
          location: user.location || '',
          avatar: user.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
          type,
          text,
          tags: tagArr,
          likes: 0,
        };
        onCreate(newPost);
        setCreating(false);
      }
    }

    return (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(44,24,74,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',borderRadius:18,padding:32,minWidth:320,maxWidth:360,boxShadow:'0 8px 32px #a084e822',position:'relative'}}>
          <button onClick={onClose} style={{position:'absolute',top:12,right:16,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#a084e8'}} title="Close">×</button>
          <h2 style={{textAlign:'center',color:'#6c47ff',marginBottom:18,fontWeight:700,letterSpacing:1}}>Create Post</h2>
          {step === 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <button onClick={()=>handleTypeSelect('picture')} style={{padding:14,borderRadius:10,border:'none',background:'linear-gradient(135deg,#a084e8 0%,#6c47ff 100%)',color:'#fff',fontWeight:600,fontSize:17,cursor:'pointer'}}>Picture</button>
              <button onClick={()=>handleTypeSelect('text')} style={{padding:14,borderRadius:10,border:'none',background:'#ede4ff',color:'#6c47ff',fontWeight:600,fontSize:17,cursor:'pointer'}}>Text</button>
            </div>
          )}
          {step === 1 && type === 'picture' && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <label style={{fontWeight:500,color:'#6c47ff'}}>Select Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{marginBottom:8}} />
              {imageUrl && <img src={imageUrl} alt="preview" style={{width:'100%',borderRadius:10,marginBottom:8}} />}
              <input type="text" placeholder="Caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid #a084e8',background:'#f5f3fa'}} />
              <button onClick={()=>setStep(2)} style={{padding:12,borderRadius:8,background:'linear-gradient(135deg,#a084e8 0%,#6c47ff 100%)',color:'#fff',border:'none',fontWeight:600,fontSize:16,cursor:'pointer'}}>Next</button>
            </div>
          )}
          {step === 1 && type === 'text' && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <textarea placeholder="What's on your mind?" value={text} onChange={e=>setText(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid #a084e8',background:'#f5f3fa',minHeight:80}} />
              <button onClick={()=>setStep(2)} style={{padding:12,borderRadius:8,background:'linear-gradient(135deg,#a084e8 0%,#6c47ff 100%)',color:'#fff',border:'none',fontWeight:600,fontSize:16,cursor:'pointer'}}>Next</button>
            </div>
          )}
          {step === 2 && (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid #a084e8',background:'#f5f3fa'}} />
              {error && <div style={{color:'#e74c3c',fontSize:14}}>{error}</div>}
              <button onClick={handleCreate} disabled={creating} style={{padding:12,borderRadius:8,background:'linear-gradient(135deg,#a084e8 0%,#6c47ff 100%)',color:'#fff',border:'none',fontWeight:600,fontSize:16,cursor:'pointer'}}>{creating ? 'Creating...' : 'Create'}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render special pages or main app
  if (window.location.pathname.endsWith('add_people.html')) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        ReactDOM.createRoot(document.getElementById('root')).render(<Auth />);
      } else {
        ReactDOM.createRoot(document.getElementById('root')).render(<AddPeoplePage user={user} />);
      }
    });
  } else if (window.location.pathname.endsWith('followers.html')) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        ReactDOM.createRoot(document.getElementById('root')).render(<Auth />);
      } else {
        ReactDOM.createRoot(document.getElementById('root')).render(<FollowersFollowingPage user={user} type="followers" />);
      }
    });
  } else if (window.location.pathname.endsWith('following.html')) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        ReactDOM.createRoot(document.getElementById('root')).render(<Auth />);
      } else {
        ReactDOM.createRoot(document.getElementById('root')).render(<FollowersFollowingPage user={user} type="following" />);
      }
    });
  // Remove profile.html direct rendering, handle via index.html only
  } else {
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  }

  // Followers/Following Page Component
  function FollowersFollowingPage({ user, type }) {
    const [list, setList] = React.useState([]);
    const [allUsers, setAllUsers] = React.useState([]);
    const db = window.firebase.firestore();
    React.useEffect(() => {
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
          setList(doc.data()[type] || []);
        }
      });
      db.collection('users').get().then(snapshot => {
        setAllUsers(snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().displayName || doc.data().username || doc.data().email || doc.id,
          username: doc.data().username || (doc.data().email ? doc.data().email.split('@')[0] : ''),
          photoURL: doc.data().photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
        })));
      });
    }, [user.uid, type]);
    return (
      <div>
        <div className="header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{
            fontFamily:'cursive', fontWeight:700, fontSize:26, letterSpacing:1,
            color: '#222',
            filter: 'drop-shadow(0 2px 8px #ececec)'
          }}>Pixels</span>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button onClick={() => {
              window.location.href = 'index.html#profile';
            }} style={{background:'none', border:'none', cursor:'pointer'}} title="Back to Profile">
              <svg className="icon" viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M15 18l-6-6 6-6" stroke="#6c47ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div className="main-content" style={{ padding: '24px 16px', maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#6c47ff', marginBottom: 24 }}>{type === 'followers' ? 'Followers' : 'Following'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {list.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888' }}>No users found.</div>
            ) : (
              list.map(uid => {
                const u = allUsers.find(userObj => userObj.id === uid);
                if (!u) return null;
                return (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#fff',
                      borderRadius: 12,
                      padding: 14,
                      boxShadow: '0 2px 8px #ececec',
                      gap: 16,
                      minHeight: 70
                    }}
                  >
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede4ff' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 18, color: '#6c47ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                      <div style={{ fontSize: 14, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{u.username}</div>
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minWidth: 80
                      }}
                      onClick={async () => {
                        if (type === 'followers') {
                          // Remove follower: remove u.id from my followers, remove me from their following
                          await db.collection('users').doc(user.uid).update({
                            followers: window.firebase.firestore.FieldValue.arrayRemove(u.id)
                          });
                          await db.collection('users').doc(u.id).update({
                            following: window.firebase.firestore.FieldValue.arrayRemove(user.uid)
                          });
                        } else {
                          // Remove following: remove u.id from my following, remove me from their followers
                          await db.collection('users').doc(user.uid).update({
                            following: window.firebase.firestore.FieldValue.arrayRemove(u.id)
                          });
                          await db.collection('users').doc(u.id).update({
                            followers: window.firebase.firestore.FieldValue.arrayRemove(user.uid)
                          });
                        }
                        // Update local state
                        setList(prev => prev.filter(id => id !== u.id));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }
}
