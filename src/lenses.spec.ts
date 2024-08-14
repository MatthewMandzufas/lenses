import lens, { set, view } from './lenses';

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
    it(`view should retrieve the value using the lens`, () => {
        expect(view(nameLens, user)).toBe('Alice');
        expect(view(cityLens, user)).toBe('Wonderland');
    });
    it(`set should update the value using the lens`, () => {
        const renamedUser = set(nameLens, 'Gerald', user);
        expect(view(nameLens, renamedUser)).toBe('Gerald');
        expect(renamedUser).not.toBe(user);
    });
});
