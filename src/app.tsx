import React, { useState, useCallback } from "react";
const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
	bs: string;
	catchPhrase: string;
	name: string;
};

type Address = {
	street: string;
	suite: string;
	city: string;
	zipcode: string;
	geo: {
		lat: string;
		lng: string;
	};
};

type User = {
	id: number;
	email: string;
	name: string;
	phone: string;
	username: string;
	website: string;
	company: Company;
	address: Address;
};

interface IButtonProps {
	onClick: () => void;
}

const Button: React.FC<IButtonProps> = React.memo(({ onClick }) => (
	<button type="button" onClick={onClick}>
		get random user
	</button>
));

interface IUserInfoProps {
	user: User | null;
}

const UserInfo: React.FC<IUserInfoProps> = React.memo(({ user }) => {
	if (!user) {
		return null;
	}
	return (
		<table>
			<thead>
				<tr>
					<th>Username</th>
					<th>Phone number</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{user.name}</td>
					<td>{user.phone}</td>
				</tr>
			</tbody>
		</table>
	);
});

const useThrottle = (callback: () => void, delay: number) => {
	const lastCall = React.useRef(0);

	return useCallback(() => {
		const now = Date.now();
		if (now - lastCall.current >= delay) {
			callback();
			lastCall.current = now;
		}
	}, [callback, delay]);
};

function App(): JSX.Element {
	const [user, setUser] = useState<User | null>(null);
	const [cache, setCache] = useState<Record<number, User>>({});

	const receiveRandomUser = useCallback(async () => {
		const id = Math.floor(Math.random() * 10) + 1;
		if (cache[id]) {
			setUser(cache[id]);
		} else {
			try {
				const response = await fetch(`${URL}/${id}`);
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				const _user = (await response.json()) as User;
				setCache((prevCache) => ({ ...prevCache, [id]: _user }));
				setUser(_user);
			} catch (error) {
				console.error("Fetching user failed", error);
			}
		}
	}, [cache]);

	const handleButtonClick = useThrottle(() => {
		receiveRandomUser();
	}, 1000);

	return (
		<div>
			<header>Get a random user</header>
			<Button onClick={handleButtonClick} />
			<UserInfo user={user} />
		</div>
	);
}

export default App;
