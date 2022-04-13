// These costs are likely to be off by at *least* a little bit, and likely to be off by a wide margin the further into the story we get!
const upgrades = {
    skills: {
        qiConversion: { 
            cost: function(num) {
                return fibbo.getMeMyCost(num);
            }
        },
        spiritAura: { // TODO: Figure out why I should implement this skill
            1: 1
        },
        spiritSense: { // TODO: Figure out why I should implement this skill
            1: 1
        }
    },
    stats: {
        qiCap: { 
            cost: function(num) {
                // Modify it so that it works for qiCap
                num = (num+1)/10;
                num -= num%1;
                num++;

                return fibbo.getMeMyCost(num);
            }     
        },
        purity: {
            cost: function(num) {
                // Modify to allow for purity
                num+=2;

                return fibbo.getMeMyCost(num);
            }
        },
        regen: {
            cost: function(num) {
                num++;
                return fibbo.getMeMyCost(num) * 10;
            }
        }
    }
}
