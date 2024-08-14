type Getter<S, A> = (state: S) => A;
type Setter<S, A> = (value: A, state: S) => S;

interface Lens<S, A> {
    get: Getter<S, A>;
    set: Setter<S, A>;
}

const lens = <S, A>(
    getter: Getter<S, A>,
    setter: Setter<S, A>
): Lens<S, A> => ({
    get: getter,
    set: setter,
});

export const view = <S, A>(lens: Lens<S, A>, state: S): A => lens.get(state);

export const set = <S, A>(lens: Lens<S, A>, newValue: any, state: S): S =>
    lens.set(newValue, state);

export default lens;
