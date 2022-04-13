
const fibbo = {
    getMeMyCost: function(num) {
        // Javascript program to find the Nth Fibonacci
        // number using Fast Doubling Method

        let a, b, c, d;
        let MOD = 1000000000007;

        // Function calculate the N-th fibanacci
        // number using fast doubling method
        function FastDoubling(n, res)
        {
            // Base Condition
            if (n == 0) {
                res[0] = 0;
                res[1] = 1;
                return;
            }
            FastDoubling(parseInt(n / 2, 10), res);

            // Here a = F(n)
            a = res[0];

            // Here b = F(n+1)
            b = res[1];

            c = 2 * b - a;

            if (c < 0) {
                c += MOD;
            }

            // As F(2n) = F(n)[2F(n+1) – F(n)]
            // Here c  = F(2n)
            c = (a * c) % MOD;

            // As F(2n + 1) = F(n)^2 + F(n+1)^2
            // Here d = F(2n + 1)
            d = (a * a + b * b) % MOD;

            // Check if N is odd
            // or even
            if (n % 2 == 0) {
                res[0] = c;
                res[1] = d;
            }
            else {
                res[0] = d;
                res[1] = c + d;
            }
        }

        // 1 1 2 3 5 8
        let res = new Array(2);
        res.fill(0);

        FastDoubling(num, res);

        return res[0];
    },
    avg_f2: [ // Average values of Fibbo numbers starting from the second 1. Used primarily in calculating returns  hopefully we won't need more than tier 20?  Hopefully???
        1,
        1.5,
        2,
        2.75,
        3.8,
        5+(1/3),
        (53/7),
        10.875,
        15+(7/9),
        23.1,
        (375/11),
        50+(2/3),
        (985/13),
        (1595/14),
        (2582/15),
        (4179/16),
        (6763/17),
        608,
        (17709/19)
    ]
}
