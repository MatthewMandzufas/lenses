import lens, { over, set, view } from './lenses';

const user = { name: 'Alice', address: { city: 'Wonderland', zip: '12345' } };

type Address = {
    city: string;
    zip: string;
};

type User = {
    name: string;
    address: Address;
};

describe(`lenses`, () => {
    const nameLens = lens<User, string>(
        (user) => user.name,
        (newName, user) => ({ ...user, name: newName })
    );
    const cityLens = lens<User, string>(
        (user) => user.address.city,
        (newCity, user) => ({
            ...user,
            address: { ...user.address, city: newCity },
        })
    );
    describe('view', () => {
        it(`should retrieve the value using the lens`, () => {
            expect(view(nameLens, user)).toBe('Alice');
            expect(view(cityLens, user)).toBe('Wonderland');
        });
    });
    describe('set', () => {
        it(`should update the value using the lens`, () => {
            const renamedUser = set(nameLens, 'Gerald', user);
            expect(renamedUser).toEqual({
                name: 'Gerald',
                address: { city: 'Wonderland', zip: '12345' },
            });
            expect(renamedUser).not.toBe(user);
        });
    });
    describe('over', () => {
        it('should modify the value using the lens', () => {
            const toUpperCase = (text: string) => text.toUpperCase();
            const modifiedUser = over(nameLens, toUpperCase, user);
            expect(modifiedUser).toEqual({
                name: 'ALICE',
                address: { city: 'Wonderland', zip: '12345' },
            });
            expect(modifiedUser).not.toBe(user);
        });
    });
    describe('state copying behaviour', () => {
        interface DeepState {
            user: User;
            meta: {
                created: string;
                modified: string;
            };
        }
        const deepState: DeepState = {
            user: {
                name: 'Alice',
                address: { city: 'Wonderland', zip: '12345' },
            },
            meta: { created: '2023-01-01', modified: '2024-01-01' },
        };

        const userLens = lens<DeepState, User>(
            (state) => state.user,
            (newUser, state) => ({ ...state, user: newUser })
        );

        const cityLens = lens<User, string>(
            (user) => user.address.city,
            (newCity, user) => ({
                ...user,
                address: { ...user.address, city: newCity },
            })
        );

        const deepCityLens = lens<DeepState, string>(
            (state) => view(cityLens, state.user),
            (newCity, state) =>
                set(userLens, set(cityLens, newCity, state.user), state)
        );
        it('set should copy the state correctly and only update the necessary parts', () => {
            const updatedState = set(deepCityLens, 'Oz', deepState);

            expect(updatedState).not.toBe(deepState);
            expect(updatedState).toEqual({
                user: { name: 'Alice', address: { city: 'Oz', zip: '12345' } },
                meta: { created: '2023-01-01', modified: '2024-01-01' },
            });
            expect(updatedState.user).not.toBe(deepState.user);
            expect(updatedState.meta).toBe(deepState.meta);
            expect(updatedState.user.name).toBe(deepState.user.name);
            expect(updatedState.user.address).not.toBe(deepState.user.address);
            expect(updatedState.user.address.city).not.toBe(
                deepState.user.address.city
            );
            expect(updatedState.user.address.zip).toBe(
                deepState.user.address.zip
            );
        });
        it('over should modify the state correctly and only update the necessary parts', () => {
            const upperCaseCityState = over(
                deepCityLens,
                (city) => city.toUpperCase(),
                deepState
            );

            // Assertions below
            expect(upperCaseCityState).not.toBe(deepState);
            expect(upperCaseCityState).toEqual({
                user: {
                    name: 'Alice',
                    address: { city: 'WONDERLAND', zip: '12345' },
                },
                meta: { created: '2023-01-01', modified: '2024-01-01' },
            });
            expect(upperCaseCityState.user).not.toBe(deepState.user);
            expect(upperCaseCityState.meta).toBe(deepState.meta);
            expect(upperCaseCityState.user.name).toBe(deepState.user.name);
            expect(upperCaseCityState.user.address).not.toBe(
                deepState.user.address
            );
            expect(upperCaseCityState.user.address.city).not.toBe(
                deepState.user.address.city
            );
            expect(upperCaseCityState.user.address.zip).toBe(
                deepState.user.address.zip
            );
        });
    });
});
