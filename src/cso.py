import numpy as np
from math import gamma


class CSO:
    def __init__(
        self,
        fitness,
        P=25,
        n=1,
        pa=0.25,
        beta=1.5,
        bound=None,
        Tmax=50,
        min=True,
        verbose=False,
        random_state=42
    ):
        self.fitness = fitness
        self.P = P
        self.n = n
        self.pa = pa
        self.beta = beta
        self.bound = bound
        self.Tmax = Tmax
        self.min = min
        self.verbose = verbose
        self.rng = np.random.default_rng(random_state)

        if bound is not None:
            self.X = np.zeros((P, n), dtype=float)
            for d, (low, high) in enumerate(bound):
                self.X[:, d] = self.rng.uniform(low, high, size=P)
        else:
            self.X = self.rng.standard_normal((P, n))

        self.F = np.array([self.fitness(x) for x in self.X], dtype=float)

        best_idx = self._best_index()
        self.best = self.X[best_idx].copy()
        self.best_fitness = float(self.F[best_idx])

    def _best_index(self):
        return int(np.argmin(self.F) if self.min else np.argmax(self.F))

    def _is_better_f(self, f1, f2):
        return f1 < f2 if self.min else f1 > f2

    def levy_flight(self):
        beta = self.beta
        sigma_u = (
            gamma(1 + beta) * np.sin(np.pi * beta / 2)
            / (gamma((1 + beta) / 2) * beta * 2 ** ((beta - 1) / 2))
        ) ** (1 / beta)

        u = self.rng.normal(0, sigma_u, size=self.n)
        v = self.rng.normal(0, 1, size=self.n)
        return u / (np.abs(v) ** (1 / beta))

    def clip_vector(self, x):
        if self.bound is None:
            return x
        x = x.copy()
        for d in range(self.n):
            low, high = self.bound[d]
            x[d] = np.clip(x[d], low, high)
        return x

    def update_levy(self):
        for i in range(self.P):
            step = self.levy_flight()
            new = self.X[i] + 0.01 * step * (self.X[i] - self.best)
            new = self.clip_vector(new)
            new_f = self.fitness(new)

            if self._is_better_f(new_f, self.F[i]):
                self.X[i] = new
                self.F[i] = new_f

    def update_random(self):
        for i in range(self.P):
            if self.rng.random() < self.pa:
                j, k = self.rng.integers(0, self.P, size=2)
                while j == k:
                    k = self.rng.integers(0, self.P)

                step = self.rng.random(self.n) * (self.X[j] - self.X[k])
                new = self.X[i] + step
                new = self.clip_vector(new)
                new_f = self.fitness(new)

                if self._is_better_f(new_f, self.F[i]):
                    self.X[i] = new
                    self.F[i] = new_f

    def update_best(self):
        best_idx = self._best_index()
        self.best = self.X[best_idx].copy()
        self.best_fitness = float(self.F[best_idx])

    def execute(self):
        for t in range(self.Tmax):
            self.update_levy()
            self.update_random()
            self.update_best()

            if self.verbose:
                print(f"Iter {t} | Best fitness: {self.best_fitness:.6f}")

        print("\nBest solution:", self.best)
        print("Best fitness:", self.best_fitness)