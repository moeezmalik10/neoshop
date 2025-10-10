const API_BASE = 'http://localhost/E-Commerce/backend/public';

// Internal auth state
const state = {
	user: null,
	token: localStorage.getItem('auth_token') || null,
	isAuthenticated: !!localStorage.getItem('auth_token'),
	isLoading: false,
	error: null,
};

const subscribers = [];

function notifySubscribers(){
	subscribers.forEach(fn => {
		try { fn(getSnapshot()); } catch(e) {}
	});
}

function setState(partial){
	Object.assign(state, partial);
	notifySubscribers();
}

function getSnapshot(){
	return {
		user: state.user,
		token: state.token,
		isAuthenticated: state.isAuthenticated,
		isLoading: state.isLoading,
		error: state.error,
	};
}

async function login(email, password){
	setState({ isLoading: true, error: null });
	try {
		const response = await fetch(`${API_BASE}/auth.php`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'login', email, password })
		});
		const data = await response.json();
		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Account not found. Please create an account first.');
			}
			throw new Error(data.error || 'Login failed');
		}
		localStorage.setItem('auth_token', data.token);
		setState({
			user: data.user || null,
			token: data.token,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		});
		return { success: true, user: data.user };
	} catch (error) {
		setState({ isLoading: false, error: error.message });
		throw error;
	}
}

async function register(name, email, password){
	setState({ isLoading: true, error: null });
	try {
		const response = await fetch(`${API_BASE}/auth.php`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'register', name, email, password })
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || 'Registration failed');
		}
		localStorage.setItem('auth_token', data.token);
		setState({
			user: data.user || null,
			token: data.token,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		});
		return { success: true, user: data.user };
	} catch (error) {
		setState({ isLoading: false, error: error.message });
		throw error;
	}
}

function logout(){
	localStorage.removeItem('auth_token');
	setState({ user: null, token: null, isAuthenticated: false, error: null });
}

function checkAuth(){
	const token = localStorage.getItem('auth_token');
	if (token) {
		setState({ token, isAuthenticated: true });
	}
}

function getAuthHeaders(){
	return state.token ? { 'Authorization': `Bearer ${state.token}` } : {};
}

function subscribe(listener){
	if (typeof listener === 'function') {
		subscribers.push(listener);
		return () => {
			const idx = subscribers.indexOf(listener);
			if (idx >= 0) subscribers.splice(idx, 1);
		};
	}
	return () => {};
}

// Public API - keep same usage: useAuthStore()
const store = {
	get user(){ return state.user; },
	get token(){ return state.token; },
	get isAuthenticated(){ return state.isAuthenticated; },
	get isLoading(){ return state.isLoading; },
	get error(){ return state.error; },
	login,
	register,
	logout,
	checkAuth,
	getAuthHeaders,
	subscribe,
};

export function useAuthStore(){
	return store;
}
