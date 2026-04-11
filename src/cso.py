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
        verbose=False
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

        # khởi tạo quần thể
        if bound:
            self.X = np.array([
                np.random.uniform(low=b[0], high=b[1], size=P)
                for b in bound
            ]).T
        else:
            self.X = np.random.randn(P, n)

        self.best = None

    def levy_flight(self):
        beta = self.beta
        sigma_u = (
            gamma(1 + beta) * np.sin(np.pi * beta / 2)
            / (gamma((1 + beta) / 2) * beta * 2 ** ((beta - 1) / 2))
        ) ** (1 / beta)

        u = np.random.normal(0, sigma_u, size=self.n)
        v = np.random.normal(0, 1, size=self.n)

        step = u / (np.abs(v) ** (1 / beta))
        return step

    # tránh lặp fitness
    def get_best(self):
        fitness_values = [self.fitness(x) for x in self.X]
        best_idx = np.argmin(fitness_values) if self.min else np.argmax(fitness_values)
        return self.X[best_idx].copy()

    def _is_better(self, x1, x2):
        if self.min:
            return self.fitness(x1) < self.fitness(x2)
        else:
            return self.fitness(x1) > self.fitness(x2)

    def clip(self):
        if self.bound:
            for i in range(self.n):
                self.X[:, i] = np.clip(
                    self.X[:, i],
                    self.bound[i][0],
                    self.bound[i][1]
                )

    def update_levy(self):
        best = self.get_best()

        for i in range(self.P):
            step = self.levy_flight()
            new = self.X[i] + 0.01 * step * (self.X[i] - best)

            if self._is_better(new, self.X[i]):
                self.X[i] = new

    def update_random(self):
        for i in range(self.P):
            if np.random.rand() < self.pa:
                j, k = np.random.randint(0, self.P, 2)
                step = np.random.rand(self.n) * (self.X[j] - self.X[k])
                new = self.X[i] + step

                if self._is_better(new, self.X[i]):
                    self.X[i] = new

    def execute(self):
        for t in range(self.Tmax):
            self.update_levy()
            self.clip()
            self.update_random()
            self.clip()

            self.best = self.get_best()

            if self.verbose:
                print(f"Iter {t} | Best fitness: {self.fitness(self.best):.4f}")

        print("\nBest solution:", self.best)
        print("Best fitness:", self.fitness(self.best))