const BattleConfig = {
    classes: [
        "Fighter", "Archer", "Barbarian", "Wizard", "Cleric", 
        "Rogue", "Paladin", "Druid", "Sorcerer", "Monk",
        "Death Knight", "Ranger", "Necromancer", "Shaman", 
        "Assassin", "Warlock", "Berserker", "Inquisitor", 
        "Elementalist", "Bladesinger"
    ],
weapons: [
    { 
        name: "Oak Wand", 
        classes: ["Wizard", "Sorcerer", "Necromancer", "Elementalist"], 
        damageBonus: 10, 
        description: "A gnarled wand of ancient oak, its grain infused with arcane sap that channels mystical energies with a gentle hum." 
    },
    { 
        name: "Ebony Staff", 
        classes: ["Wizard", "Sorcerer", "Druid", "Necromancer", "Shaman"], 
        damageBonus: 20, 
        description: "A sleek staff of polished ebony, carved with runes that pulse with mystical power, amplifying spells with dark resonance." 
    },
    { 
        name: "Claymore", 
        classes: ["Fighter", "Barbarian", "Berserker", "Death Knight"], 
        damageBonus: 30, 
        description: "A massive two-handed blade of tempered steel, its broad edge honed to cleave through armor with unrelenting force." 
    },
    { 
        name: "Longsword", 
        classes: ["Fighter", "Paladin", "Inquisitor", "Bladesinger"], 
        damageBonus: 20, 
        description: "A balanced longsword of gleaming steel, its razor-sharp blade crafted for swift, precise strikes in skilled hands." 
    },
    { 
        name: "Longbow", 
        classes: ["Archer", "Ranger"], 
        damageBonus: 20, 
        description: "A sturdy longbow of yew, its taut string firing arrows with deadly precision across vast distances." 
    },
    { 
        name: "Crossbow", 
        classes: ["Archer", "Rogue", "Assassin"], 
        damageBonus: 20, 
        description: "A compact crossbow of reinforced wood, launching bolts with piercing force, ideal for stealthy ambushes." 
    },
    { 
        name: "Holy Mace", 
        classes: ["Cleric", "Paladin", "Inquisitor"], 
        damageBonus: 20, 
        description: "A sanctified mace of silvered iron, glowing with divine light that crushes foes with righteous might." 
    },
    { 
        name: "Dagger", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 10, 
        description: "A slender dagger of blackened steel, its needle-sharp point perfect for stealthy, lethal strikes." 
    },
    { 
        name: "Quarterstaff", 
        classes: ["Monk", "Druid", "Shaman"], 
        damageBonus: 10, 
        description: "A versatile staff of seasoned wood, balanced for swift spins and strikes, channeling natural energies." 
    },
    { 
        name: "Halberd", 
        classes: ["Fighter", "Paladin", "Inquisitor"], 
        damageBonus: 30, 
        description: "A towering polearm with a steel axe-head, its sweeping attacks cleave through ranks with brutal efficiency." 
    },
    { 
        name: "Warhammer", 
        classes: ["Fighter", "Barbarian", "Berserker"], 
        damageBonus: 30, 
        description: "A heavy warhammer of forged iron, its blunt head designed to crush armor and bone with devastating impact." 
    },
    { 
        name: "Shortsword", 
        classes: ["Rogue", "Fighter", "Assassin"], 
        damageBonus: 10, 
        description: "A nimble shortsword of tempered steel, its sharp edge ideal for quick, lethal thrusts in close combat." 
    },
    { 
        name: "Battleaxe", 
        classes: ["Barbarian", "Fighter", "Berserker"], 
        damageBonus: 30, 
        description: "A broad battleaxe of hardened steel, its curved blade crafted to cleave through enemies with savage force." 
    },
    { 
        name: "Flail", 
        classes: ["Fighter", "Paladin", "Inquisitor"], 
        damageBonus: 20, 
        description: "A spiked flail of iron and chain, swinging with crushing momentum to batter foes into submission." 
    },
    { 
        name: "Rapier", 
        classes: ["Rogue", "Fighter", "Bladesinger"], 
        damageBonus: 20, 
        description: "A slender rapier of polished steel, its pinpoint edge designed for precise, lightning-fast thrusts." 
    },
    { 
        name: "Greatsword", 
        classes: ["Fighter", "Barbarian", "Death Knight"], 
        damageBonus: 40, 
        description: "A colossal greatsword of reinforced steel, its massive blade delivering devastating, sweeping blows." 
    },
    { 
        name: "Scimitar", 
        classes: ["Fighter", "Rogue", "Bladesinger"], 
        damageBonus: 20, 
        description: "A curved scimitar of gleaming bronze, its sharp edge honed for fluid, slashing attacks." 
    },
    { 
        name: "Morningstar", 
        classes: ["Fighter", "Cleric", "Inquisitor"], 
        damageBonus: 20, 
        description: "A spiked morningstar of forged iron, its brutal head designed for bone-crushing, armor-piercing strikes." 
    },
    { 
        name: "Trident", 
        classes: ["Fighter", "Paladin", "Elementalist"], 
        damageBonus: 20, 
        description: "A three-pronged trident of tempered steel, its piercing tips ideal for thrusting with aquatic precision." 
    },
    { 
        name: "Spear", 
        classes: ["Fighter", "Druid", "Ranger"], 
        damageBonus: 20, 
        description: "A long spear of ash and steel, its pointed head thrusting with extended reach and deadly accuracy." 
    },
    { 
        name: "Glaive", 
        classes: ["Fighter", "Paladin", "Bladesinger"], 
        damageBonus: 30, 
        description: "A polearm with a curved steel blade, slashing with long-reaching arcs to dominate the battlefield." 
    },
    { 
        name: "Maul", 
        classes: ["Barbarian", "Berserker"], 
        damageBonus: 40, 
        description: "A massive maul of solid iron, its heavy head smashing through defenses with earth-shaking force." 
    },
    { 
        name: "Handaxe", 
        classes: ["Barbarian", "Fighter", "Ranger"], 
        damageBonus: 10, 
        description: "A light handaxe of sharpened steel, balanced for throwing or swift melee strikes." 
    },
    { 
        name: "Javelin", 
        classes: ["Fighter", "Druid", "Ranger"], 
        damageBonus: 20, 
        description: "A sleek javelin of wood and steel, thrown with pinpoint precision to pierce distant foes." 
    },
    { 
        name: "Sling", 
        classes: ["Archer", "Rogue", "Assassin"], 
        damageBonus: 10, 
        description: "A simple sling of leather, hurling stones with surprising speed and accuracy." 
    },
    { 
        name: "Whip", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 10, 
        description: "A braided whip of leather, lashing with painful strikes that entangle and disarm." 
    },
    { 
        name: "Falchion", 
        classes: ["Fighter", "Bladesinger"], 
        damageBonus: 20, 
        description: "A broad, curved falchion of polished steel, its edge slicing with devastating arcs." 
    },
    { 
        name: "Kukri", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 10, 
        description: "A curved kukri of blackened steel, its angled blade perfect for quick, slicing cuts." 
    },
    { 
        name: "Greataxe", 
        classes: ["Barbarian", "Berserker"], 
        damageBonus: 40, 
        description: "A massive greataxe of forged iron, its double-edged blade built for catastrophic destruction." 
    },
    { 
        name: "Lance", 
        classes: ["Paladin", "Inquisitor"], 
        damageBonus: 30, 
        description: "A sturdy lance of oak and steel, charging with piercing force to impale foes." 
    },
    { 
        name: "Club", 
        classes: ["Druid", "Monk", "Shaman"], 
        damageBonus: 10, 
        description: "A rugged club of knotted wood, simple yet effective for bludgeoning strikes." 
    },
    { 
        name: "Sickle", 
        classes: ["Druid", "Shaman"], 
        damageBonus: 10, 
        description: "A curved sickle of sharpened bronze, reaping foes with swift, natural fury." 
    },
    { 
        name: "Katana", 
        classes: ["Fighter", "Monk", "Bladesinger"], 
        damageBonus: 20, 
        description: "A sleek katana of folded steel, its razor edge slicing with elegant precision." 
    },
    { 
        name: "Nunchaku", 
        classes: ["Monk"], 
        damageBonus: 10, 
        description: "A pair of nunchaku, wooden sticks linked by chain, swinging with rapid, disorienting strikes." 
    },
    { 
        name: "Shuriken", 
        classes: ["Rogue", "Monk", "Assassin"], 
        damageBonus: 10, 
        description: "Star-shaped shuriken of tempered steel, thrown with deadly accuracy to pierce vital points." 
    },
    { 
        name: "Bo Staff", 
        classes: ["Monk", "Shaman"], 
        damageBonus: 10, 
        description: "A polished bo staff of hardwood, spinning with defensive prowess and striking force." 
    },
    { 
        name: "War Pick", 
        classes: ["Fighter", "Berserker"], 
        damageBonus: 20, 
        description: "A sturdy war pick of iron, its pointed head piercing through armor with brutal efficiency." 
    },
    { 
        name: "Cutlass", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 20, 
        description: "A curved cutlass of polished steel, slashing with a pirate’s ruthless precision." 
    },
    { 
        name: "Mace", 
        classes: ["Cleric", "Inquisitor"], 
        damageBonus: 20, 
        description: "A flanged mace of sanctified iron, crushing with holy might and divine authority." 
    },
    { 
        name: "Poleaxe", 
        classes: ["Fighter", "Death Knight"], 
        damageBonus: 30, 
        description: "A versatile poleaxe of steel, combining axe and hammer for devastating strikes." 
    },
    { 
        name: "Bastard Sword", 
        classes: ["Fighter", "Bladesinger"], 
        damageBonus: 30, 
        description: "A versatile bastard sword of tempered steel, wielded one- or two-handed for deadly versatility." 
    },
    { 
        name: "Claidhmore", 
        classes: ["Barbarian", "Berserker"], 
        damageBonus: 40, 
        description: "A legendary two-handed sword of ancient steel, its massive blade cleaving with primal fury." 
    },
    { 
        name: "Recurve Bow", 
        classes: ["Archer", "Ranger"], 
        damageBonus: 20, 
        description: "A curved recurve bow of laminated wood, firing powerful shots with enhanced tension." 
    },
    { 
        name: "Yew Wand", 
        classes: ["Wizard", "Necromancer"], 
        damageBonus: 10, 
        description: "A slender wand of yew, humming with arcane potential, guiding spells with precision." 
    },
    { 
        name: "Crystal Staff", 
        classes: ["Sorcerer", "Elementalist"], 
        damageBonus: 20, 
        description: "A staff of shimmering crystal, radiating chaotic energy that amplifies magical strikes." 
    },
    { 
        name: "Iron Shield", 
        classes: ["Fighter", "Paladin", "Inquisitor"], 
        damageBonus: 0, 
        description: "A sturdy iron shield, forged to block incoming attacks with unyielding strength." 
    },
    { 
        name: "Throwing Knife", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 10, 
        description: "A balanced throwing knife of steel, flying silently to its target with lethal intent." 
    },
    { 
        name: "Spiked Chain", 
        classes: ["Rogue", "Warlock"], 
        damageBonus: 20, 
        description: "A spiked chain of blackened iron, entangling and tearing foes with vicious lashes." 
    },
    { 
        name: "Double Axe", 
        classes: ["Barbarian", "Berserker"], 
        damageBonus: 30, 
        description: "A dual-bladed axe of forged steel, delivering relentless attacks with savage precision." 
    },
    { 
        name: "Holy Staff", 
        classes: ["Cleric", "Shaman"], 
        damageBonus: 10, 
        description: "A sacred staff of whitewood, channeling divine blessings with radiant energy." 
    },
    { 
        name: "Druidic Scythe", 
        classes: ["Druid", "Shaman"], 
        damageBonus: 20, 
        description: "A curved scythe of iron and vine, reaping foes with the fury of untamed nature." 
    },
    { 
        name: "Necrotic Blade", 
        classes: ["Death Knight", "Necromancer"], 
        damageBonus: 20, 
        description: "A longsword etched with runes of decay, its blade seeping dark energy that wounds with each strike." 
    },
    { 
        name: "Spirit Totem", 
        classes: ["Shaman"], 
        damageBonus: 10, 
        description: "A carved totem of bone and wood, channeling ancestral spirits with each resonant strike." 
    },
    { 
        name: "Infernal Chain", 
        classes: ["Warlock"], 
        damageBonus: 20, 
        description: "A spiked chain wreathed in demonic fire, lashing foes with burning, relentless fury." 
    },
    { 
        name: "Stormlash", 
        classes: ["Elementalist"], 
        damageBonus: 20, 
        description: "A whip crackling with lightning, striking with the elemental fury of a raging storm." 
    }
],
legendaryWeapons: [
    { 
        name: "Aurorathorne", 
        classes: ["Fighter", "Paladin", "Inquisitor", "Bladesinger"], 
        damageBonus: 300, 
        description: "Aurorathorne, the radiant blade of sovereigns, is forged from star-kissed adamant, its surface gleaming with a silvery luminescence that pulses with celestial mandate. Crafted by master smiths under the light of a cosmic convergence, its edge is honed to a supernatural keenness, capable of sundering enchanted plate as if it were silk. The hilt, bound in the hide of a celestial wyrm and studded with luminous opals, channels the wielder’s valor, making each strike a decree of divine authority. Aurorathorne sings with a harmonic resonance, a sacred relic that banishes shadows and rallies the hearts of warriors with its majestic sweep." 
    },
    { 
        name: "Vyrnmaw", 
        classes: ["Barbarian", "Berserker", "Death Knight"], 
        damageBonus: 400, 
        description: "Vyrnmaw is a blade of cataclysmic hunger, forged in the molten crucibles of a nether abyss from a dark, void-wrought iron that swallows light and hope. Its serrated edge, sharpened to a near-molecular precision, thrums with a ravenous malice, rumored to consume the essence of its victims, leaving only desolate shells. The craftsmanship is both masterful and blasphemous, with jagged glyphs of ruin etched along its blade, flaring with ember-like glow in the presence of blood. The hilt, wrapped in the braided tendons of vanquished colossi, clings to the wielder’s grip as if possessed, goading them into a maelstrom of carnage. To wield Vyrnmaw is to court oblivion, its power a perilous bargain with the wielder’s soul." 
    },
    { 
        name: "Glacivyrn", 
        classes: ["Fighter", "Paladin", "Inquisitor"], 
        damageBonus: 350, 
        description: "Glacivyrn, a chilling runeblade of unparalleled might, was forged within the frozen heart of an eternal ice spire, infused with the spirit of a primordial frost drake. Crafted from a rare, azure-hued alloy that remains perpetually cold, its blade is razor-keen, able to carve through iron and flesh with a frostbitten whisper. Intricate sigils of dominion are engraved across its surface, glowing with a wintry radiance that can halt the blood of enemies in their veins. The hilt, adorned with the fossilized ivory of ancient leviathans and wrapped in ice-woven sinew, exudes a biting chill that challenges the wielder’s fortitude. Glacivyrn is both weapon and omen, its frozen embrace offering triumph shadowed by an encroaching darkness." 
    },
    { 
        name: "Soulshatter", 
        classes: ["Death Knight", "Necromancer"], 
        damageBonus: 320, 
        description: "Soulshatter, a jagged greatsword of blackened bone, pulses with necrotic energy that rends both body and soul. Forged in the crypts of a fallen empire, its serrated edge is imbued with the screams of the damned, cutting through life with unnatural ease. The hilt, wrapped in grave-leather and studded with obsidian skulls, grips the wielder like a curse, amplifying their dark will. Each swing unleashes a wail of torment, sapping the spirit of all who face it." 
    },
    { 
        name: "Starshot Longbow", 
        classes: ["Archer", "Ranger"], 
        damageBonus: 300, 
        description: "Starshot Longbow, carved from celestial wood kissed by starlight, fires arrows that streak like comets across the sky. Its string, woven from ethereal threads, hums with cosmic tension, guiding each shot with divine precision. The bow’s grip, inlaid with astral gems, steadies the archer’s hand, ensuring no target escapes its radiant wrath. A relic of the heavens, Starshot turns the battlefield into a canvas of celestial destruction." 
    },
    { 
        name: "Hellspire Talisman", 
        classes: ["Warlock"], 
        damageBonus: 310, 
        description: "Hellspire Talisman, a crimson relic of demonic pacts, radiates infernal flames that consume all in its path. Forged in the fires of an abyssal forge, its spiked surface pulses with the heartbeat of a bound fiend, amplifying the warlock’s strikes with hellish fury. The talisman’s chain, wrought from molten brimstone, binds it to the wielder’s will, unleashing torrents of fire with each gesture. It is a weapon of apocalyptic ambition, burning through hope and steel alike." 
    },
    { 
        name: "Windreaver", 
        classes: ["Elementalist", "Bladesinger"], 
        damageBonus: 300, 
        description: "Windreaver, a scimitar of storm-forged steel, slashes with the unrelenting fury of a hurricane. Its blade, etched with spiraling runes of air, sings with each swing, summoning gales that tear through defenses. The hilt, wrapped in tempest-woven silk, channels the wielder’s elemental will, guiding the blade with preternatural speed. Forged atop a lightning-struck peak, Windreaver is a tempest in hand, reshaping the battlefield with its stormy wrath." 
    },
    { 
        name: "Ghostcrown", 
        classes: ["Shaman"], 
        damageBonus: 290, 
        description: "Ghostcrown, a spectral circlet of bone and mist, channels ancestral wrath with each ethereal strike. Crafted by shamanic rites under a moonless sky, its faint glow summons spirits that lash out with chilling force. The crown’s jagged edges, adorned with phantom feathers, bind it to the spirit world, amplifying the shaman’s strikes with otherworldly power. It is a relic of the departed, turning the battlefield into a haunted realm of vengeance." 
    },
    { 
        name: "Nightreaver", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 300, 
        description: "Nightreaver, a twin-bladed dagger cloaked in shadow, slices with the silence of a moonless night. Forged from void-touched steel, its edges are honed to vanish in darkness, striking vital points with lethal precision. The hilt, wrapped in nightshade leather, melds with the wielder’s grip, guiding each cut with predatory intent. Nightreaver is a phantom’s fang, leaving only whispers of its passage amidst fallen foes." 
    },
    { 
        name: "Bloodhowl Axe", 
        classes: ["Barbarian", "Berserker"], 
        damageBonus: 320, 
        description: "Bloodhowl Axe, a massive axe of primal iron, drips with the rage of ancient beasts, cleaving with unstoppable force. Its double-edged blade, etched with savage runes, sings a dirge of slaughter with each swing, splitting armor and bone. The haft, carved from blood-oak, pulses with the wielder’s fury, driving them into a frenzy. Forged in a crucible of war, Bloodhowl is a harbinger of carnage, its roars echoing across the battlefield." 
    }
],
epicWeapons: [
    { 
        name: "Emberwythe Bow", 
        classes: ["Archer", "Ranger"], 
        damageBonus: 250, 
        description: "Emberwythe Bow, a marvel of primal craftsmanship, is hewn from the petrified sinew and bone of an ancient flame-serpent, its taut string woven from the beast’s own fiery tendons. Each arrow loosed from its elegantly curved limbs ignites mid-flight, trailing embers that erupt into searing conflagrations upon impact. The bow’s grip, inlaid with smoldering rubies and polished to a glassy sheen, pulses with residual heat, steadying the archer’s aim with an almost sentient will. Forged by nomadic artisans under a blood-red moon, its craftsmanship ensures unmatched precision, capable of piercing the heart of a storm itself. To wield Emberwythe is to command the wrath of a primordial blaze, each shot a blazing testament to its untamed power." 
    },
    { 
        name: "Duskspire", 
        classes: ["Rogue", "Assassin"], 
        damageBonus: 200, 
        description: "Duskspire, a sleek and sinister dagger, is forged from an obsidian-like alloy tempered in the shadows of a forgotten eclipse, its blade so sharp it whispers through armor and flesh without resistance. The weapon’s surface ripples with a faint, twilight sheen, cloaking it in near-invisibility when wielded in dim light. Its hilt, wrapped in the hide of a nocturnal predator and adorned with a single, smoky quartz, fits the rogue’s hand like an extension of their will, guiding each thrust with lethal precision. Crafted by secretive bladesmiths who worked only by starlight, Duskspire is a masterpiece of stealth, its strikes as silent as the night itself, leaving no trace but the fallen. It is a blade that thrives in the dark, a predator’s fang made manifest." 
    },
    { 
        name: "Stormclad Maul", 
        classes: ["Cleric", "Paladin", "Inquisitor"], 
        damageBonus: 300, 
        description: "Stormclad Maul, a towering warhammer of divine fury, is forged from a rare sky-iron meteorite, its massive head etched with spiraling runes that crackle with latent tempestuous energy. Each swing unleashes a thunderous shockwave, summoning arcs of lightning that dance across the battlefield, searing foes with celestial wrath. The haft, carved from storm-felled oak and bound with electrum bands, thrums with the pulse of an impending gale, grounding the wielder’s resolve. Crafted by holy artificers during a raging tempest, its flawless balance belies its crushing weight, allowing it to pulverize armor and bone with godlike force. Stormclad Maul is a harbinger of divine judgment, its blows echoing like the roar of an angry sky." 
    },
    { 
        name: "Cryptfang", 
        classes: ["Death Knight"], 
        damageBonus: 220, 
        description: "Cryptfang, a serrated longsword steeped in necromantic ichor, drips with dark malice, wounding with each vicious strike. Forged in a crypt’s unhallowed depths, its blade is etched with curses that sap vitality, leaving foes weakened. The hilt, wrapped in grave-shroud cloth, pulses with a cold, unnatural life, guiding the knight’s hand. Cryptfang is a blade of relentless decay, its cuts a prelude to the grave." 
    },
    { 
        name: "Spiritweave Scepter", 
        classes: ["Shaman", "Druid"], 
        damageBonus: 200, 
        description: "Spiritweave Scepter, woven from vines and bone, channels the spirits’ wrath with each resonant strike. Crafted under a shaman’s trance, its surface shimmers with ghostly light, amplifying the wielder’s connection to the beyond. The scepter’s head, adorned with spectral feathers, hums with ancestral power, smiting foes with ethereal force. It is a bridge to the spirit world, turning the battlefield into a sacred rite." 
    },
    { 
        name: "Flameveil Dagger", 
        classes: ["Warlock", "Assassin"], 
        damageBonus: 210, 
        description: "Flameveil Dagger, a curved blade wreathed in infernal flames, burns with each precise cut. Forged in a demonic crucible, its edge glows with a malevolent heat, searing flesh and soul alike. The hilt, wrapped in charred leather, channels the warlock’s dark will, guiding the blade with deadly intent. Flameveil is a weapon of fiery subterfuge, its strikes leaving trails of smoldering ruin." 
    },
    { 
        name: "Tidal Glaive", 
        classes: ["Elementalist"], 
        damageBonus: 230, 
        description: "Tidal Glaive, a polearm surging with oceanic power, strikes with the force of a crashing tsunami. Its blade, forged from coral-infused steel, shimmers with aqueous light, cutting with fluid precision. The haft, carved from driftwood, channels the sea’s wrath, amplifying each swing with elemental might. Crafted on a storm-lashed shore, Tidal Glaive drowns the battlefield in its relentless tide." 
    },
    { 
        name: "Runeblade", 
        classes: ["Bladesinger"], 
        damageBonus: 220, 
        description: "Runeblade, a slender sword etched with arcane runes, dances with magical precision in the hands of a bladesinger. Its blade, tempered in starlight, hums with enchanted energy, slicing through defenses with graceful ease. The hilt, wrapped in spellwoven silk, merges spell and steel, guiding each strike with mystical accuracy. Runeblade is a symphony of magic and martial art, its cuts a poetic devastation." 
    },
    { 
        name: "Skullcrusher", 
        classes: ["Berserker"], 
        damageBonus: 240, 
        description: "Skullcrusher, a brutal hammer forged from giant’s bone, smashes with savage, bone-shattering force. Its massive head, carved with primal sigils, delivers blows that echo like thunder, splintering armor and foes alike. The haft, bound in blood-stained leather, fuels the berserker’s rage, driving each strike with relentless fury. Skullcrusher is a weapon of raw carnage, its impact reshaping the battlefield." 
    },
    { 
        name: "Purgeflame Brand", 
        classes: ["Inquisitor"], 
        damageBonus: 230, 
        description: "Purgeflame Brand, a flaming sword of divine judgment, sears the wicked with holy fire. Forged in a sacred pyre, its blade burns with radiant flames, cutting through corruption with unyielding zeal. The hilt, adorned with sanctified relics, channels the inquisitor’s fervor, guiding each strike with righteous precision. Purgeflame is a beacon of retribution, its fire cleansing the battlefield of sin." 
    }
],
spells: [
    { 
        name: "Fireball", 
        classes: ["Sorcerer", "Elementalist"], 
        damage: "d6 * units", 
        effect: "May apply Burning", 
        description: "Fireball ignites the battlefield with a roiling sphere of flame, hurled by a sorcerer’s or elementalist’s command. The orb erupts in a blazing explosion, engulfing foes in searing heat that may set them alight with persistent flames. Its molten core, drawn from primal fire, melts armor and scorches earth, leaving a smoldering ruin. This spell is a pyre of raw power, its detonation a harbinger of chaos that consumes entire ranks." 
    },
    { 
        name: "Magic Missile", 
        classes: ["Wizard", "Bladesinger"], 
        damage: "3d4", 
        description: "Magic Missile conjures unerring darts of arcane light, launched by a wizard’s or bladesinger’s precise will. These glowing projectiles weave through defenses, striking foes with infallible accuracy, piercing flesh and armor alike. Forged from pure magical essence, their radiant trails illuminate the battlefield, marking the caster’s unmatched skill. This spell is a symphony of precision, its darts a relentless assault on the enemy’s heart." 
    },
    { 
        name: "Entangle", 
        classes: ["Druid", "Shaman"], 
        damage: "d4", 
        effect: "May apply Wounded", 
        description: "Entangle summons a writhing mass of thorny vines, called forth by a druid’s or shaman’s bond with nature. These living snares bind enemies in a crushing embrace, their barbs tearing into flesh to inflict lingering wounds. The vines pulse with the earth’s primal wrath, rooting foes in place as the battlefield becomes a verdant trap. Entangle is nature’s vengeance, a spell that humbles the mighty with its relentless grip." 
    },
    { 
        name: "Lightning Bolt", 
        classes: ["Sorcerer", "Elementalist"], 
        damage: "d8 * units", 
        description: "Lightning Bolt channels a sorcerer’s or elementalist’s command of storms, unleashing a jagged arc of electricity that fries foes in its path. The bolt crackles with blinding fury, its thunderous roar shaking the battlefield as it sears through ranks. Drawn from the heart of a tempest, its raw power electrifies the air, leaving scorched earth in its wake. This spell is a storm’s wrath, a devastating surge that obliterates all in its line." 
    },
    { 
        name: "Arcane Blast", 
        classes: ["Wizard", "Bladesinger"], 
        damage: "d6 * units", 
        description: "Arcane Blast releases a burst of raw arcane energy, shaped by a wizard’s or bladesinger’s masterful will. The explosion radiates with violet light, tearing through enemies with chaotic force that rends both body and soul. Its power, drawn from the ether’s depths, surges with the caster’s intent, overwhelming defenses. Arcane Blast is a testament to arcane supremacy, its detonation reshaping the battlefield in a wave of mystic devastation." 
    },
    { 
        name: "Divine Smite", 
        classes: ["Paladin", "Inquisitor"], 
        damage: "d8", 
        description: "Divine Smite channels a paladin’s or inquisitor’s holy wrath, striking with a radiant blow that sears the wicked. The attack glows with celestial light, its force purging corruption with divine authority. Forged from fervent faith, its impact reverberates through the battlefield, shattering evil’s resolve. This spell is a judgment from the heavens, its strike a beacon of righteousness amidst the chaos of war." 
    },
    { 
        name: "Moonbeam", 
        classes: ["Druid", "Shaman"], 
        damage: "d6", 
        effect: "May apply Burning", 
        description: "Moonbeam calls down a shaft of silvery light, summoned by a druid’s or shaman’s communion with the lunar spirit. The beam sears enemies with radiant heat, potentially igniting them in ghostly flames that cling relentlessly. Its ethereal glow bathes the battlefield, weakening foes under the moon’s gaze. Moonbeam is a celestial rite, its light a purifying force that burns away the unworthy." 
    },
    { 
        name: "Chaos Bolt", 
        classes: ["Sorcerer", "Warlock"], 
        damage: "d8 * units", 
        description: "Chaos Bolt hurls a volatile orb of wild energy, shaped by a sorcerer’s or warlock’s untamed power. Its unpredictable hues twist through the air, striking with erratic force that lashes out across enemy ranks. Drawn from the chaos of creation, its impact disrupts formations with raw, anarchic might. This spell is a tempest of destruction, its lashings a dance of cosmic disorder." 
    },
    { 
        name: "Thorn Whip", 
        classes: ["Druid", "Shaman"], 
        damage: "d6", 
        description: "Thorn Whip conjures a barbed vine, wielded by a druid’s or shaman’s will to lash and pull foes. The whip’s thorns tear into flesh, dragging enemies into vulnerable positions with unrelenting force. Grown from the earth’s primal heart, its strikes resonate with nature’s fury, binding the battlefield in verdant chains. Thorn Whip is a lash of the wild, its reach a reminder of nature’s dominion." 
    },
    { 
        name: "Flaming Sphere", 
        classes: ["Druid", "Sorcerer", "Elementalist"], 
        damage: "d6", 
        effect: "May apply Burning", 
        description: "Flaming Sphere summons a rolling orb of fire, guided by a druid’s, sorcerer’s, or elementalist’s command. The sphere burns a path through enemies, its searing heat potentially igniting foes in relentless flames. Forged from elemental fire, its molten trail scars the battlefield, sowing chaos. Flaming Sphere is a blazing juggernaut, its path a testament to the caster’s fiery will." 
    },
    { 
        name: "Guiding Bolt", 
        classes: ["Cleric", "Inquisitor"], 
        damage: "d6", 
        description: "Guiding Bolt launches a radiant bolt of divine light, fired by a cleric’s or inquisitor’s sacred focus. The bolt marks its target with a glowing sigil, illuminating them for further attacks while searing their flesh. Drawn from celestial grace, its brilliance pierces the battlefield’s gloom, guiding allies to victory. Guiding Bolt is a divine beacon, its strike a call to righteous retribution." 
    },
    { 
        name: "Ice Knife", 
        classes: ["Wizard", "Druid", "Elementalist"], 
        damage: "d4", 
        effect: "May apply Wounded", 
        description: "Ice Knife conjures a shard of enchanted ice, thrown by a wizard’s, druid’s, or elementalist’s will to pierce and explode. The knife shatters on impact, its frozen fragments wounding foes with chilling cuts that linger. Forged from winter’s heart, its icy burst chills the battlefield, slowing enemies. Ice Knife is a frozen fang, its detonation a cascade of frost and pain." 
    },
    { 
        name: "Spirit Guardians", 
        classes: ["Cleric", "Shaman"], 
        damage: "d6", 
        description: "Spirit Guardians summons a swarm of spectral protectors, called by a cleric’s or shaman’s divine will. These ghostly spirits swirl around foes, striking with ethereal force that rends both body and soul. Drawn from the realms beyond, their presence hallows the battlefield, shielding allies. Spirit Guardians is a sacred storm, its spirits a relentless tide against the enemy." 
    },
    { 
        name: "Call Lightning", 
        classes: ["Druid", "Elementalist"], 
        damage: "d8", 
        description: "Call Lightning summons a storm’s fury, directed by a druid’s or elementalist’s primal will to unleash bolts of electricity. The lightning crashes with deafening force, frying foes in a blaze of elemental wrath. Drawn from the heart of the tempest, its strikes electrify the battlefield, shattering resistance. Call Lightning is a storm’s vengeance, its bolts a cataclysm of nature’s power." 
    },
    { 
        name: "Scorching Ray", 
        classes: ["Sorcerer", "Warlock"], 
        damage: "3d6", 
        description: "Scorching Ray fires three blazing rays of fire, launched by a sorcerer’s or warlock’s fiery will. The rays streak toward foes, their searing heat burning through armor and flesh with relentless precision. Forged from infernal or primal flames, their trails light the battlefield in a fiery glow. Scorching Ray is a barrage of destruction, its rays a relentless assault of flame." 
    },
    { 
        name: "Death Coil", 
        classes: ["Death Knight", "Necromancer"], 
        damage: "d6", 
        effect: "May apply Wounded", 
        description: "Death Coil weaves a spiral of necrotic energy, cast by a death knight’s or necromancer’s dark will to sap enemy vitality. The coil binds its target in a chilling embrace, wounding flesh and spirit with lingering decay. Drawn from the grave’s embrace, its dark tendrils haunt the battlefield, weakening foes. Death Coil is a curse of the underworld, its touch a prelude to oblivion." 
    },
    { 
        name: "Shadow Veil", 
        classes: ["Assassin"], 
        damage: "d4", 
        description: "Shadow Veil cloaks an assassin in a shroud of darkness, striking from hiding with deadly precision. The spell’s inky tendrils guide the blade to vital points, cutting with silent, surgical force. Woven from the essence of night, its fleeting shadow obscures the battlefield, leaving no trace. Shadow Veil is a phantom’s strike, its cut a whisper of death in the dark." 
    },
    { 
        name: "Stormcall", 
        classes: ["Elementalist"], 
        damage: "d8", 
        effect: "May apply Stunned", 
        description: "Stormcall summons a bolt of lightning, directed by an elementalist’s command of the tempest. The bolt crashes with thunderous force, stunning foes with its blinding impact and searing heat. Drawn from the storm’s heart, its electric surge electrifies the battlefield, shattering resolve. Stormcall is a thunderous decree, its strike a tempest’s wrath unleashed." 
    }
],
ancientSpells: [
    { 
        name: "Meteor Swarm", 
        classes: ["Sorcerer", "Elementalist"], 
        damage: "d8 * units", 
        effect: "May apply Burning, Stunned", 
        description: "Meteor Swarm conjures a cataclysmic tempest of blazing celestial fragments, summoned from the cosmos by a sorcerer’s or elementalist’s indomitable will. Each meteor, forged of starfire and cosmic stone, streaks through the heavens with a deafening roar, crashing upon the battlefield in a deluge of molten devastation. The impact craters glow with residual heat, capable of igniting foes in searing flames or leaving them dazed amidst the shattered earth. Woven through ancient incantations, this spell’s chaotic energy overwhelms defenses, its sheer scale turning armies to ash and altering the terrain itself with its apocalyptic might." 
    },
    { 
        name: "Arcane Cataclysm", 
        classes: ["Wizard", "Bladesinger"], 
        damage: "3d6", 
        effect: "May apply Stunned", 
        description: "Arcane Cataclysm unleashes a torrential wave of raw, unshackled arcane power, meticulously channeled by a wizard’s or bladesinger’s mastery of forbidden lore. The spell erupts as a shimmering vortex of violet and indigo energies, tearing through reality itself to engulf foes in a maelstrom of destructive force. Its chaotic pulses can stun adversaries, locking their minds in a fleeting moment of cosmic awe as the arcane tide rends armor and flesh. Crafted from the primal essence of the multiverse, this spell is a testament to the caster’s intellect, capable of shattering formations and leaving enemies reeling in its radiant aftermath." 
    },
    { 
        name: "Void Cascade", 
        classes: ["Sorcerer", "Warlock"], 
        damage: "d6 * units", 
        effect: "May apply Stunned", 
        description: "Void Cascade summons a surging rift to the outer dark, a sorcerer’s or warlock’s perilous pact with the abyss that floods the battlefield with tendrils of nullifying energy. These inky, star-flecked streams writhe with unnatural life, enveloping enemies in a chilling embrace that saps their resolve and can leave them stunned, frozen by glimpses of infinite nothingness. Forged through rituals whispered in forgotten tongues, the spell’s potency grows with the caster’s forces, its cascading waves eroding defenses and sowing dread. Void Cascade is a spectacle of cosmic terror, turning the tide of battle with its relentless, otherworldly onslaught." 
    },
    { 
        name: "Oblivion Shroud", 
        classes: ["Necromancer"], 
        damage: "3d6", 
        effect: "May apply Stunned", 
        description: "Oblivion Shroud envelops the battlefield in a veil of dark energy, summoned by a necromancer’s communion with the grave. The shroud’s spectral tendrils plunge foes into visions of the underworld, stunning them with the weight of eternal nothingness. Its chilling embrace, woven from the essence of death, rends both body and spirit with relentless force. Oblivion Shroud is a harbinger of the end, its dark waves a necromancer’s decree that silences the living." 
    }
],
forsakenRuneSpells: [
    { 
        name: "Necrotic Surge", 
        classes: ["Druid", "Necromancer"], 
        damage: "d6 * units", 
        effect: "May apply Wounded, Stunned", 
        description: "Necrotic Surge channels the malign power of forsaken runes, etched into the earth by a druid’s or necromancer’s communion with decay’s primal essence. This spell unleashes a creeping tide of corrosive miasma, its sickly green tendrils seeping into flesh and bone, weakening foes with lingering wounds or stunning them as their vitality ebbs. The runes pulse with a baleful light, amplifying the spell’s reach with the caster’s forces, rotting armor and spirit alike. Rooted in the cycle of death and rebirth, Necrotic Surge is both a weapon and a ritual, its dark embrace sapping entire legions while heralding nature’s inevitable reclamation." 
    },
    { 
        name: "Soul Reaper", 
        classes: ["Cleric", "Inquisitor"], 
        damage: "3d4", 
        effect: "May apply Stunned", 
        description: "Soul Reaper invokes a cleric’s or inquisitor’s grim authority over life’s final threshold, summoning a spectral scythe of pale, ghostly light that cleaves through the essence of the living. Forged from divine wrath and tempered by forbidden rites, its ethereal edge slices with unerring precision, capable of stunning foes as their souls tremble before oblivion’s call. The spell’s radiant arc leaves a chill in the air, its power a stark reminder of mortality’s weight. Wielded by those who walk the line between salvation and damnation, Soul Reaper is a divine reckoning, its strikes sowing fear and faltering resolve among enemy ranks." 
    },
    { 
        name: "Wraithbloom", 
        classes: ["Druid", "Shaman"], 
        damage: "d8", 
        effect: "May apply Wounded", 
        description: "Wraithbloom awakens a sinister grove of spectral flora, summoned by a druid’s or shaman’s invocation of cursed earth and forsaken runes. From the ground erupt ghostly vines and thorns, their pallid forms dripping with necrotic sap that lacerates foes, leaving festering wounds that sap strength and endurance. The spell’s eerie blossoms pulse with a faint, mournful light, their roots entwining enemies in a chilling grasp that heralds decay. Crafted through rituals tied to the underworld’s edge, Wraithbloom transforms the battlefield into a haunted mire, its creeping tendrils weakening entire platoons with the relentless hunger of the grave." 
    },
    { 
        name: "Bloodrune Curse", 
        classes: ["Death Knight"], 
        damage: "d6", 
        effect: "May apply Wounded", 
        description: "Bloodrune Curse inscribes a malignant rune of blood and shadow, cast by a death knight’s necromantic will to sap life from foes. The rune’s crimson glow pulses with cursed energy, wounding enemies with festering cuts that drain their strength. Forged in the crucible of dark rituals, its power clings to the battlefield, weakening entire ranks. Bloodrune Curse is a death knight’s grim edict, its wounds a prelude to the inevitable embrace of death." 
    }
],
specialAbilities: [
    { 
        class: "Fighter", 
        name: "Rallying Strike", 
        chance: 0.05, 
        effect: "boostDamage", 
        value: 1.4, 
        description: "Rallying Strike channels a fighter’s unyielding resolve, transforming a single blow into a clarion call that galvanizes the battlefield. With a thunderous swing, the fighter’s weapon blazes with martial fervor, amplifying damage by 40% as the strike cleaves through armor and bone with relentless precision. This ability, born from countless battles, inspires nearby allies to fight with renewed vigor, turning the tide against overwhelming odds. It is the embodiment of the fighter’s indomitable spirit, a moment where skill and courage forge victory from chaos." 
    },
    { 
        class: "Archer", 
        name: "Precision Volley", 
        chance: 0.05, 
        effect: "multiTarget", 
        value: 2, 
        description: "Precision Volley unleashes an archer’s uncanny marksmanship, loosing a flurry of arrows with such deadly accuracy that they find multiple foes in a single breath. This masterful barrage strikes two additional enemies at half strength, each projectile whistling through the air like a harbinger of doom. Crafted through years of disciplined training, the volley’s pinpoint precision disrupts enemy formations, sowing chaos as arrows rain from above. It is a testament to the archer’s eagle-eyed focus, turning a single shot into a cascade of destruction." 
    },
    { 
        class: "Barbarian", 
        name: "Berserk Rage", 
        chance: 0.05, 
        effect: "boostDamageRecoil", 
        value: 1.3, 
        description: "Berserk Rage ignites a barbarian’s primal fury, a savage outburst that surges through their veins like wildfire, boosting damage by 30% as they hack through foes with reckless abandon. This frenzied state, however, exacts a toll, sacrificing 5% of their troops to the bloodlust’s reckless charge. The barbarian’s roars shake the earth, their weapon a blur of destruction that carves paths through enemy ranks. Rooted in the untamed heart of the wild, this ability is a double-edged storm, embodying the barbarian’s fearless, all-consuming wrath." 
    },
    { 
        class: "Wizard", 
        name: "Arcane Surge", 
        chance: 0.05, 
        effect: "boostSpell", 
        value: 1.4, 
        description: "Arcane Surge taps into a wizard’s mastery of the ethereal, unleashing a torrent of raw magical energy that amplifies spell damage by 40%. As the wizard’s hands weave incandescent sigils, the air crackles with power, their incantations bending reality to unleash devastating arcane might. This surge, drawn from forbidden tomes and cosmic insight, overwhelms enemies with its radiant intensity, leaving them scorched by the wizard’s intellect. It is a fleeting glimpse of the infinite, a moment where the wizard’s will reshapes the battlefield in a blaze of mystic glory." 
    },
    { 
        class: "Cleric", 
        name: "Divine Blessing", 
        chance: 0.05, 
        effect: "heal", 
        value: 0.1, 
        description: "Divine Blessing invokes a cleric’s sacred bond with the divine, calling forth a radiant aura that restores 10% of a platoon’s starting troops. Bathed in golden light, wounded warriors rise anew, their injuries mended by the touch of celestial grace. The cleric’s fervent prayers resonate across the battlefield, bolstering morale and defying death’s grasp. This miracle, woven from faith and sanctity, is a beacon of hope amidst carnage, proving that the cleric’s devotion can turn the tide by renewing their allies’ strength." 
    },
    { 
        class: "Rogue", 
        name: "Shadow Strike", 
        chance: 0.05, 
        effect: "boostDamage", 
        value: 1.4, 
        description: "Shadow Strike is a rogue’s deadly art, a precise and silent assault that boosts damage by 40% as they melt into the darkness to deliver a lethal blow. With a blade that gleams only in the moment of impact, the rogue strikes vital points with surgical accuracy, leaving foes unaware until it’s too late. This ability, honed in alleys and moonless nights, exploits every weakness, turning the rogue into a phantom of death. It is the epitome of cunning, a single cut that can shift the battle’s momentum in an instant." 
    },
    { 
        class: "Paladin", 
        name: "Holy Aegis", 
        chance: 0.05, 
        effect: "reduceDamage", 
        value: 0.3, 
        description: "Holy Aegis summons a paladin’s divine protection, erecting a shimmering barrier of sanctified light that reduces incoming damage by 30%. As the paladin raises their weapon in defiance, the aegis pulses with holy resolve, deflecting blows and shielding allies from harm. Forged through unwavering faith and martial discipline, this sacred ward stands as a bulwark against evil, absorbing the brunt of enemy assaults. It is the paladin’s oath made manifest, a radiant shield that holds the line when all seems lost." 
    },
    { 
        class: "Druid", 
        name: "Thorned Vines", 
        chance: 0.05, 
        effect: "applyCondition", 
        value: "Wounded", 
        description: "Thorned Vines calls upon a druid’s bond with the wild, summoning writhing tendrils of barbed flora that entangle foes, inflicting the Wounded condition. These living snares, pulsing with the earth’s primal fury, tear into flesh and armor, slowing enemies and sapping their strength. The druid’s whispered chants awaken the land itself, turning the battlefield into a verdant trap. This ability, rooted in nature’s unyielding embrace, is a reminder that the wild bows to no one, its thorns a relentless scourge against invaders." 
    },
    { 
        class: "Sorcerer", 
        name: "Chaos Bolt", 
        chance: 0.05, 
        effect: "boostSpellStun", 
        value: 1.3, 
        description: "Chaos Bolt unleashes a sorcerer’s wild magic, hurling a crackling orb of volatile energy that boosts spell damage by 30% and may stun its target. The bolt twists through the air, its hues shifting unpredictably as it channels the raw chaos of the cosmos. When it strikes, it erupts in a dazzling burst, disorienting foes with its erratic power. Born from the sorcerer’s untamed spirit, this spell is a tempest of destruction, its stunning impact capable of breaking enemy lines with a single, anarchic surge." 
    },
    { 
        class: "Monk", 
        name: "Focused Strike", 
        chance: 0.05, 
        effect: "boostAccuracyDamage", 
        value: { hit: 0.2, damage: 1.2 }, 
        description: "Focused Strike embodies a monk’s disciplined harmony, channeling inner chi into a devastating blow that increases accuracy and damage by 20%. With serene precision, the monk’s strike becomes a blur of controlled power, striking vital points with unerring force. This technique, perfected through years of meditation and training, transforms the monk into a living weapon, their movements a dance of lethal grace. It is the pinnacle of mind and body united, a single strike that shatters defenses and reverberates through the battlefield." 
    },
    { 
        class: "Death Knight", 
        name: "Grave Pulse", 
        chance: 0.05, 
        effect: "applyCondition", 
        value: "Wounded", 
        description: "Grave Pulse unleashes a death knight’s necromantic malice, emitting a chilling wave of dark energy that inflicts the Wounded condition on foes. As the knight’s blade glows with a sickly green aura, the air grows heavy with the stench of decay, weakening enemies as their vitality seeps away. This ability, born from a pact with death itself, sows despair among the living, its corrupting touch lingering like a curse. The death knight’s grim presence turns the battlefield into a charnel ground, their power a relentless harbinger of doom." 
    },
    { 
        class: "Ranger", 
        name: "Wild Ambush", 
        chance: 0.05, 
        effect: "boostDamage", 
        value: 1.4, 
        description: "Wild Ambush channels a ranger’s mastery of the untamed frontier, striking from concealment with a ferocity that boosts damage by 40%. Moving like a shadow through the wilds, the ranger’s attack—whether arrow or blade—lands with devastating force, exploiting the terrain to catch foes unaware. Honed by a life of tracking and survival, this ability turns the battlefield into the ranger’s hunting ground, each strike a predator’s pounce. It is the essence of the wilds’ wrath, a sudden onslaught that leaves enemies reeling." 
    },
    { 
        class: "Necromancer", 
        name: "Death’s Grasp", 
        chance: 0.05, 
        effect: "boostSpellStun", 
        value: 1.3, 
        description: "Death’s Grasp invokes a necromancer’s dominion over the grave, weaving a spell of spectral chains that boosts damage by 30% and may stun foes. The air grows cold as ghostly tendrils lash out, binding enemies in an icy embrace that saps their will to fight. This dark magic, drawn from the necromancer’s communion with the underworld, disrupts formations with its chilling grip. It is a spell of unrelenting dread, turning the battlefield into a mausoleum where the necromancer’s will reigns supreme." 
    },
    { 
        class: "Shaman", 
        name: "Spirit Call", 
        chance: 0.05, 
        effect: "heal", 
        value: 0.1, 
        description: "Spirit Call summons a shaman’s ancestral allies, invoking ethereal spirits that restore 10% of a platoon’s starting troops with their rejuvenating touch. As the shaman chants, the air shimmers with ghostly forms, their whispers mending wounds and bolstering resolve. This sacred rite, rooted in the shaman’s bond with the spirit world, weaves life from the beyond, defying the chaos of battle. It is a haunting melody of renewal, a bridge between worlds that strengthens the living with the wisdom of the departed." 
    },
    { 
        class: "Assassin", 
        name: "Viper’s Fang", 
        chance: 0.05, 
        effect: "boostDamage", 
        value: 1.4, 
        description: "Viper’s Fang is an assassin’s lethal precision, a strike coated in venomous intent that boosts damage by 40%. With a flicker of their blade, the assassin delivers a wound that burns through flesh and spirit, exploiting every vulnerability with surgical skill. Honed in the shadows of betrayal and secrecy, this ability is a silent promise of death, its impact as swift as a serpent’s strike. The assassin’s cold efficiency turns the battlefield into a gallery of fallen foes, each mark a testament to their deadly craft." 
    },
    { 
        class: "Warlock", 
        name: "Pact Inferno", 
        chance: 0.05, 
        effect: "applyCondition", 
        value: "Burning", 
        description: "Pact Inferno calls upon a warlock’s infernal bargain, unleashing a blaze of demonic flames that inflicts the Burning condition on enemies. The warlock’s eyes glow with hellfire as the ground erupts in searing runes, engulfing foes in unrelenting torment. This dark pact, sealed with otherworldly entities, channels raw destruction, its flames clinging to armor and flesh alike. The battlefield becomes a pyre under the warlock’s command, their fiery wrath a reminder of the perilous cost of their power." 
    },
    { 
        class: "Berserker", 
        name: "Blood Frenzy", 
        chance: 0.05, 
        effect: "boostDamageRecoil", 
        value: 1.3, 
        description: "Blood Frenzy awakens a berserker’s savage hunger, a relentless onslaught that boosts damage by 30% at the cost of 5% of their troops, lost to the frenzy’s reckless fury. The berserker’s weapon becomes an extension of their rage, carving through enemies in a whirlwind of gore. This primal surge, fueled by the scent of blood and the thrill of combat, transforms the berserker into a force of nature, unstoppable yet perilous. It is chaos incarnate, a storm of violence that reshapes the battlefield in its crimson wake." 
    },
    { 
        class: "Inquisitor", 
        name: "Zealot’s Verdict", 
        chance: 0.05, 
        effect: "reduceDamage", 
        value: 0.3, 
        description: "Zealot’s Verdict cloaks an inquisitor in divine retribution, summoning a radiant aura that reduces incoming damage by 30%. With a fervent prayer, the inquisitor’s presence becomes a bastion of judgment, deflecting attacks with an unyielding will. This sacred resolve, forged in the crucible of fanaticism, shields allies from harm while condemning the wicked. The battlefield trembles under the inquisitor’s gaze, their verdict a divine mandate that holds fast against the tides of war." 
    },
    { 
        class: "Elementalist", 
        name: "Tempest Surge", 
        chance: 0.05, 
        effect: "boostSpell", 
        value: 1.4, 
        description: "Tempest Surge harnesses an elementalist’s command over primal forces, unleashing a torrent of elemental power that amplifies spell damage by 40%. As the elementalist gestures, the air roars with wind, fire, and lightning, their spells erupting with cataclysmic force. This surge, drawn from the heart of nature’s fury, overwhelms foes with its raw intensity, reshaping the battlefield in elemental chaos. It is the elementalist’s will made manifest, a storm of creation and destruction that bends the elements to their command." 
    },
    { 
        class: "Bladesinger", 
        name: "Sword Dance", 
        chance: 0.05, 
        effect: "boostAccuracyDamage", 
        value: { hit: 0.2, damage: 1.2 }, 
        description: "Sword Dance is a bladesinger’s mesmerizing artistry, a fluid blend of spell and steel that increases accuracy and damage by 20%. With graceful precision, the bladesinger weaves arcane sigils into their strikes, each movement a lethal ballet that finds its mark with unerring grace. This technique, born from the fusion of magic and martial prowess, turns the bladesinger into a whirlwind of enchanted blades. The battlefield becomes their stage, each step and swing a performance of deadly elegance that carves through foes with poetic finality." 
    }
],
battlefields: [
    { 
        name: "Volcano Caldera Edge", 
        description: "Perched atop the smoldering rim of an active volcano, the Volcano Caldera Edge is a hellscape of blistering heat and molten fury, where the ground trembles with the mountain’s restless heart. Rivers of glowing lava snake through the cracked basalt, casting an eerie crimson light that dances on armor and blades, while choking ash clouds the air, stinging eyes and throats. Jagged obsidian outcrops offer perilous footing, threatening to slice through boots or collapse under weight, making every step a gamble. The oppressive heat saps strength, and sudden eruptions can send molten sprays skyward, turning this battlefield into a crucible where only the most resolute survive.", 
        effect: [
            "A surge of molten lava erupts from the caldera, scorching units in its fiery path.",
            "Geysers of searing magma burst from the cracked earth, engulfing warriors in blistering heat.",
            "A cascade of glowing embers rains down, burning troops with unrelenting fury."
        ], 
        terrainEffect: [
            "Scorching embers ignite platoons, setting their armor ablaze.",
            "Splashes of molten lava may set units alight, flames clinging to their forms.",
            "Fiery gusts from the volcano’s heart risk kindling infernos among the ranks."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Glacial Mountain Pass", 
        description: "The Glacial Mountain Pass is a perilous corridor carved between towering, ice-clad peaks, where biting winds howl like mournful spirits and frost clings to every surface. Sheer cliffs of blue ice loom overhead, their surfaces cracked and unstable, threatening to unleash avalanches of snow and jagged shards that bury the unwary in a frozen tomb. The narrow path, slick with black ice, forces warriors to tread carefully, as a single misstep could send them sliding into yawning crevasses hidden beneath the snow. The air is so cold it sears the lungs, sapping warmth and slowing reflexes, making this pass a brutal test of endurance and caution.", 
        effect: [
            "A deafening avalanche of snow and ice thunders down, burying units in a frigid grave.",
            "Cracked ice cliffs collapse, entombing warriors beneath a crushing deluge of frost.",
            "A sudden slide of packed snow engulfs troops, trapping them in the pass’s icy embrace."
        ], 
        terrainEffect: [
            "Slick ice underfoot may slow platoons, hindering their movements.",
            "Chilling winds sweep through, stiffening limbs and delaying advances.",
            "Hidden crevasses risk impeding units, forcing cautious, sluggish steps."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Grand Canyon Skybridge", 
        description: "Spanning the vast, vertiginous chasm of the Grand Canyon, the Grand Canyon Skybridge is a rickety lattice of weathered ropes and splintered planks, swaying precariously in the gusting winds that roar through the canyon’s depths. The bridge creaks ominously underfoot, its frayed supports straining against the weight of warriors, while the dizzying drop below reveals jagged rocks and a winding river far out of reach. Dust storms sweep across the canyon, stinging eyes and obscuring vision, as the relentless wind threatens to hurl combatants into the abyss. Every step tests courage and balance, turning this fragile crossing into a harrowing gauntlet where a single gust can spell doom.", 
        effect: [
            "A howling gust sweeps across the skybridge, hurling units into the canyon’s depths.",
            "Violent winds batter the rickety bridge, casting warriors to the rocks below.",
            "A sudden squall rocks the swaying planks, flinging troops into the void."
        ], 
        terrainEffect: [
            "Swirling dust storms disrupt ranged attacks, obscuring targets in the wind.",
            "Gusting winds may throw arrows and bolts off course, hindering accuracy.",
            "The bridge’s sway risks misaligning shots, fouling ranged precision."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Great Plains Thunderstorm", 
        description: "The Great Plains Thunderstorm engulfs an endless expanse of windswept grasslands under a roiling sky, where towering storm clouds unleash torrents of rain and jagged bolts of lightning that strike with indiscriminate fury. The ground, churned to slick mud, clings to boots and slows movement, while the deafening roar of thunder drowns out commands, sowing chaos among ranks. Sudden gusts whip the tall grasses into a frenzy, obscuring vision and making ranged attacks a gamble against the storm’s wrath. The air crackles with electric tension, and each lightning strike illuminates the battlefield in stark, fleeting clarity, threatening to electrocute warriors caught in its path.", 
        effect: [
            "A jagged bolt of lightning crashes down, electrocuting units in a blinding flash.",
            "Thunder roars as a sizzling arc strikes, shocking warriors with searing energy.",
            "A sudden lightning strike splits the sky, frying troops in its electric fury."
        ], 
        terrainEffect: [
            "Thunderous shocks may stun platoons, leaving them reeling from the storm.",
            "Electric surges risk dazing units, disrupting their focus with crackling force.",
            "Storm-charged air might stagger troops, stunning them amidst the tempest."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Marshy Swamps of Doom", 
        description: "The Marshy Swamps of Doom are a festering quagmire of stagnant water and tangled reeds, where the air hangs heavy with the stench of rot and the buzz of venomous insects. Quicksand pits lurk beneath the murky surface, ready to swallow the careless in a suffocating embrace, while gnarled mangroves offer treacherous footing amid the sucking mud. Sinister eyes glint from the shadows, as serpents and other deadly creatures stalk the unwary, their bites delivering searing poison. The oppressive humidity saps strength, and the swamp’s miasma clings to armor, making every movement a struggle in this perilous, life-draining morass.", 
        effect: [
            "A hidden quicksand pit engulfs units, dragging them into the swamp’s murky depths.",
            "Sucking mud traps warriors, swallowing them in the quagmire’s relentless grip.",
            "A treacherous bog claims troops, pulling them under with suffocating force."
        ], 
        terrainEffect: [
            "Venomous creatures may poison platoons, their bites seeping with deadly toxins.",
            "Fetid swamp gases risk envenoming units, weakening them with noxious fumes.",
            "Hidden serpents might taint troops with venom, sapping their strength."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Crimson Desert Dunes", 
        description: "The Crimson Desert Dunes stretch across a scorching wasteland of blood-red sands, where the relentless sun bakes the earth and mirages shimmer on the horizon, taunting warriors with false promises of relief. Towering dunes shift underfoot, their unstable slopes threatening to collapse and bury combatants in suffocating waves of grit, while sudden sandstorms howl with blinding ferocity, scouring flesh and obscuring sight. The air is dry and searing, parching throats and weakening resolve, as the desert’s oppressive heat warps metal and tests endurance. This unforgiving expanse is a crucible of survival, where only the hardiest can withstand the dunes’ relentless assault.", 
        effect: [
            "A roaring sandstorm surges across the dunes, burying units in choking grit.",
            "Collapsing dunes entomb warriors, smothering them beneath waves of red sand.",
            "A blinding tempest of sand engulfs troops, trapping them in the desert’s wrath."
        ], 
        terrainEffect: [
            "Swirling sandstorms may reduce visibility, cloaking the battlefield in dust.",
            "Scouring winds risk obscuring sight, shrouding enemies in a crimson haze.",
            "Shifting dunes might veil the field, hindering vision with gritty clouds."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Jungle Canopy Arena", 
        description: "High above the jungle floor, the Jungle Canopy Arena is a tangled labyrinth of swaying branches and thick vines, where warriors battle amidst the verdant chaos of a dense, primeval forest. The air is thick with humidity and the cacophony of unseen creatures, their cries mingling with the rustle of leaves as predatory jaguars and venomous serpents lurk in the shadows, ready to pounce. Unstable boughs creak underfoot, threatening to snap and plunge combatants into the abyss below, while clinging creepers entangle limbs, hindering movement. The dim, filtered sunlight casts treacherous shadows, turning this lofty arena into a deadly dance of stealth and survival.", 
        effect: [
            "A stealthy jaguar pounces from the canopy, mauling units with savage claws.",
            "Feral predators leap from the shadows, tearing into warriors with primal fury.",
            "A hidden beast ambushes troops, rending them with sharp fangs and talons."
        ], 
        terrainEffect: [
            "Tangled vines may entangle platoons, binding their limbs in the jungle’s grip.",
            "Creeping tendrils risk snaring units, slowing them amidst the canopy’s maze.",
            "Thick creepers might ensnare troops, hindering movement in the verdant chaos."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Frozen Tundra Abyss", 
        description: "The Frozen Tundra Abyss is a desolate wasteland of endless snow and howling winds, where the ground is a deceptive blanket hiding deadly ice crevasses that yawn like the maws of forgotten gods. Towering glaciers loom in the distance, their jagged edges glinting with a cruel, pale light, while the biting cold seeps through armor, numbing limbs and clouding minds. Hidden fissures lie beneath the snow, ready to swallow entire platoons into their icy depths, leaving no trace but a fleeting scream. The relentless chill of this barren expanse tests even the staunchest warriors, making survival as much a foe as the enemy.", 
        effect: [
            "A hidden crevasse opens beneath units, swallowing them into the tundra’s icy maw.",
            "Cracked ice gives way, plunging warriors into the abyss’s frozen depths.",
            "A concealed fissure claims troops, entombing them in the tundra’s cold embrace."
        ], 
        terrainEffect: [
            "Biting winds may freeze platoons, chilling their bones and slowing their steps.",
            "Icy gusts risk encasing units in frost, numbing their limbs with cold.",
            "Frigid air might stiffen troops, hindering movement with glacial chill."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Haunted Forest Clearing", 
        description: "Shrouded in an unnatural mist, the Haunted Forest Clearing is a sinister glade where ancient, twisted trees loom like silent sentinels, their gnarled branches clawing at the sky. The air is heavy with an eerie chill, and faint whispers echo through the fog, as ghostly apparitions flicker at the edge of vision, sowing dread among warriors. The soft, mossy ground belies hidden roots that trip the unwary, while the oppressive atmosphere frays nerves, making every shadow a potential threat. This accursed clearing is a place where the veil between worlds thins, and fear itself becomes a weapon as deadly as any blade.", 
        effect: [
            "Spectral wraiths emerge from the mist, scaring units into panicked flight.",
            "Ghostly apparitions wail, driving warriors from the clearing in terror.",
            "Phantasmal shades haunt troops, scattering them with chilling dread."
        ], 
        terrainEffect: [
            "Eerie whispers may frighten platoons, sowing panic in their ranks.",
            "Unseen spirits risk unnerving units, shaking their resolve with fear.",
            "Haunting visions might terrify troops, disrupting their courage in the mist."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Meteor Shower Crater", 
        description: "The Meteor Shower Crater is a desolate, pockmarked basin scarred by celestial impacts, where the sky rains fiery meteors that streak through the heavens with apocalyptic fury. The jagged, blackened ground is littered with smoldering debris, its uneven surface offering no safe footing as embers glow faintly in the dust, threatening sudden explosions. The air hums with the tension of impending impacts, each meteor’s crash sending shockwaves that rattle armor and bone. This barren arena, forged by the wrath of the cosmos, is a crucible of chaos where survival hinges on agility and defiance against the heavens’ wrath.", 
        effect: [
            "A blazing meteor crashes into the crater, crushing units beneath its fiery weight.",
            "Celestial rocks plummet from the sky, pulverizing warriors in explosive impacts.",
            "A fiery comet slams into the ground, shattering troops with cosmic force."
        ], 
        terrainEffect: [
            "Smoldering debris may cause explosions, detonating amidst platoons.",
            "Glowing embers risk igniting blasts, erupting in fiery chaos.",
            "Unstable rubble might trigger bursts, shattering the battlefield."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Pirate Cove Whirlpool", 
        description: "Nestled among jagged, barnacle-encrusted rocks, the Pirate Cove Whirlpool is a treacherous coastal battlefield dominated by a colossal, churning vortex that roars with the ocean’s untamed might. The rocky shore is slick with seaweed and spray, offering perilous footing as towering waves crash against the cliffs, threatening to drag warriors into the sea’s embrace. The air is thick with salt and the cries of gulls, while the whirlpool’s relentless pull tugs at limbs, making every step a battle against the tide. This cove is a graveyard of ships and souls, where the sea itself is a merciless adversary.", 
        effect: [
            "The whirlpool’s relentless pull drowns units, dragging them into the abyss.",
            "A surging tide sweeps warriors into the vortex, swallowing them in the deep.",
            "Churning waters claim troops, pulling them under the cove’s deadly currents."
        ], 
        terrainEffect: [
            "Treacherous waves may pull platoons, tugging them toward the whirlpool.",
            "Crashing tides risk dragging units, unsettling their footing on the shore.",
            "The vortex’s draw might unbalance troops, yanking them toward the sea."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Sky Fortress Ruins", 
        description: "The Sky Fortress Ruins are the crumbling remnants of a once-majestic citadel suspended in the clouds, its shattered stone platforms and rusted metal beams teetering on the brink of collapse. Gusting winds howl through the skeletal structure, swaying precarious walkways that creak under the weight of warriors, threatening to plummet them into the void below. Faint arcane runes flicker on the weathered stones, hinting at the fortress’s lost glory, while patches of unstable flooring give way without warning. This aerial battlefield demands unwavering focus, as a single misstep can send entire platoons crashing through the ruins to their doom.", 
        effect: [
            "A crumbling platform collapses, sending units plummeting through the ruins.",
            "Rusted beams give way, casting warriors into the fortress’s shattered depths.",
            "Unstable flooring shatters, dropping troops into the void below."
        ], 
        terrainEffect: [
            "Swaying walkways may destabilize footing, unbalancing platoons.",
            "Creaking platforms risk unsteadying units, hindering their stance.",
            "Shifting ruins might disrupt balance, shaking troops on fragile ground."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Toxic Wasteland Pits", 
        description: "The Toxic Wasteland Pits are a blighted expanse of cracked, barren earth, where bubbling pools of viscous, glowing sludge emit noxious fumes that choke the lungs and corrode metal. The ground is littered with the rusted husks of forgotten machinery, their jagged edges snagging armor as warriors navigate the treacherous terrain. The air shimmers with a sickly green haze, burning eyes and weakening resolve, while sudden geysers of toxic waste erupt without warning, dousing all in their path. This polluted hellscape is a crucible of endurance, where every breath is a gamble against the wasteland’s relentless poison.", 
        effect: [
            "A geyser of toxic sludge erupts, poisoning units with corrosive fumes.",
            "Noxious vapors billow from the pits, tainting warriors with deadly toxins.",
            "A burst of acidic waste douses troops, searing them with poisonous mist."
        ], 
        terrainEffect: [
            "Acidic fumes may corrode armor, weakening platoons’ defenses.",
            "Toxic haze risks eroding gear, degrading units’ protection.",
            "Caustic vapors might eat at armor, sapping troops’ resilience."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Ancient Temple Traps", 
        description: "The Ancient Temple Traps lie within a crumbling stone edifice, its shadowed halls adorned with faded glyphs and statues of forgotten deities, where the air is thick with the dust of ages. Hidden mechanisms lurk beneath the mosaic floors, triggering volleys of razor-sharp spikes, crushing boulders, or collapsing walls that pulverize the unwary. Creeping vines and loose tiles conceal deadly pitfalls, while the oppressive silence is broken only by the grind of ancient gears, signaling imminent danger. This labyrinth of traps is a testament to a lost civilization’s ingenuity, turning every step into a perilous dance with death.", 
        effect: [
            "A barrage of spikes erupts from the walls, crushing units in their path.",
            "Rolling boulders thunder through the halls, pulverizing warriors in their wake.",
            "A collapsing wall traps troops, smashing them beneath ancient stone."
        ], 
        terrainEffect: [
            "Hidden mechanisms may trigger traps, unleashing deadly surprises on platoons.",
            "Ancient devices risk activating snares, catching units in lethal ambushes.",
            "Concealed pitfalls might spring traps, endangering troops with sudden hazards."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Stormy Ocean Cliff", 
        description: "Perched atop a sheer cliff overlooking a roiling, storm-tossed ocean, the Stormy Ocean Cliff is a battlefield lashed by howling winds and towering waves that crash against the jagged rocks below. The slick, moss-covered stone offers treacherous footing, as relentless rain blinds warriors and turns the ground to a muddy quagmire. Sudden gusts threaten to hurl combatants over the edge, while rogue waves surge upward, sweeping away those too close to the precipice. This tempestuous arena is a trial of balance and resilience, where the ocean’s wrath is as deadly as any foe.", 
        effect: [
            "A rogue wave surges up the cliff, sweeping units into the stormy sea.",
            "Crashing tides lash the rocks, dragging warriors to a watery doom.",
            "A towering breaker floods the cliff, washing troops into the ocean’s grasp."
        ], 
        terrainEffect: [
            "Slippery rocks may disrupt balance, unsteadying platoons on the cliff.",
            "Driving rain risks throwing off footing, hindering units’ stability.",
            "Muddy slopes might unbalance troops, shaking their stance on the edge."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Crystal Cavern Depths", 
        description: "The Crystal Cavern Depths are a subterranean marvel of shimmering, razor-sharp crystal formations that refract torchlight into dazzling, disorienting patterns across the cavern’s walls. Jagged stalactites hang like chandeliers of glass, trembling with the cavern’s subtle tremors, ready to plummet and impale those below, while the uneven floor is strewn with crystalline shards that slice through boots. The air is cool and resonant, carrying the faint hum of latent magical energy, but sudden quakes can trigger cave-ins, burying warriors in a cascade of glittering debris. This radiant yet deadly labyrinth demands precision and caution, as beauty and danger are inextricably entwined.", 
        effect: [
            "A trembling stalactite plummets, impaling units with crystalline shards.",
            "Shaking caverns dislodge crystal spears, piercing warriors in their fall.",
            "A quaking roof drops jagged prisms, skewering troops in a glittering cascade."
        ], 
        terrainEffect: [
            "Unstable walls may cause cave-ins, burying platoons in crystal rubble.",
            "Shifting caverns risk collapsing, entombing units in shimmering debris.",
            "Quaking floors might trigger cave-ins, trapping troops under falling crystals."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Blizzard Peak Summit", 
        description: "The Blizzard Peak Summit is a windswept pinnacle cloaked in an unrelenting blizzard, where swirling snow obscures vision and freezing gusts cut through armor like a blade. The rocky outcrops, encrusted with ice, offer precarious footing, as the howling wind threatens to hurl warriors into the abyssal drops below. The air is so cold it crystallizes breath, sapping warmth and dulling reflexes, while sudden squalls can bury combatants in blinding drifts. This desolate summit is a frozen crucible, where survival demands unyielding willpower against the mountain’s merciless chill.", 
        effect: [
            "Freezing winds lash the summit, chilling units to the bone with icy fury.",
            "A biting squall sweeps the peak, numbing warriors in its frigid grasp.",
            "Icy gusts howl across the cliffs, freezing troops in the blizzard’s wrath."
        ], 
        terrainEffect: [
            "Swirling snow may reduce visibility, cloaking the summit in white haze.",
            "Blinding drifts risk obscuring sight, veiling enemies in the storm.",
            "Whirling flurries might shroud the peak, hindering vision with icy clouds."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Abandoned Mine Shaft", 
        description: "The Abandoned Mine Shaft is a claustrophobic maze of crumbling tunnels, where flickering torchlight reveals rotting wooden supports and jagged rock walls dripping with moisture. The air is thick with dust and the acrid scent of explosive gas pockets, which can ignite with a single spark, engulfing warriors in roaring flames. Collapsing timbers and loose rubble threaten to bury platoons alive, while the oppressive darkness conceals hidden pitfalls and unstable floors. This forsaken labyrinth is a death trap, where every step echoes with the mine’s decaying groans, heralding potential catastrophe.", 
        effect: [
            "A pocket of volatile gas ignites, incinerating units in a fiery explosion.",
            "Sparks trigger a roaring blast, engulfing warriors in the mine’s flames.",
            "An explosive gas cloud detonates, searing troops in a blazing inferno."
        ], 
        terrainEffect: [
            "Lingering gas pockets may ignite, setting platoons ablaze in the tunnels.",
            "Volatile fumes risk catching fire, kindling flames among the ranks.",
            "Unstable gases might erupt, igniting units in a sudden conflagration."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Spectral Volcano Rift", 
        description: "The Spectral Volcano Rift is a jagged chasm glowing with an otherworldly radiance, where molten rock bubbles alongside eerie, ghostly flames that flicker with unnatural life. The scorched ground pulses with spectral energy, its cracked surface releasing phantasmal embers that dance in the sulfurous air, burning with a cold, unearthly fire. Twisted, petrified trees stand as silent witnesses, their shadows shifting in the rift’s haunting light, while sudden eruptions of ghostly fire can engulf warriors in torment. This supernatural battlefield blurs the line between the material and the ethereal, a realm where the living tread at the mercy of restless spirits.", 
        effect: [
            "Ghostly flames erupt from the rift, burning units with spectral fire.",
            "Phantasmal embers flare, searing warriors with eerie, chilling flames.",
            "A surge of spectral fire engulfs troops, scorching them with otherworldly heat."
        ], 
        terrainEffect: [
            "Ethereal energies may summon spirits, haunting platoons with ghostly wrath.",
            "Spectral embers risk conjuring wraiths, unsettling units with their presence.",
            "Unnatural flames might call shades, disturbing troops with eerie apparitions."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Sinking Coral Atoll", 
        description: "The Sinking Coral Atoll is a fading tropical haven, its vibrant reefs crumbling into the turquoise ocean as relentless waves erode the fragile land. Jagged coral spires rise from the shallows, their razor-sharp edges glinting under the sun, threatening to tear flesh with every misstep. The air hums with the drone of insects and the briny tang of salt, while dark fins slice through the surrounding waters, where ravenous sharks lurk, ready to strike. The shifting, waterlogged ground, slick with algae, demands constant caution, as the rising tide transforms this sinking paradise into a deadly trap.", 
        effect: [
            "Ravenous sharks surge from the depths, dragging units beneath the churning waves.",
            "Sleek predators strike from the surf, pulling warriors into the atoll’s watery maw.",
            "Jaws of the deep snap shut, yanking troops under the flooding tide."
        ], 
        terrainEffect: [
            "Crashing waves may flood the terrain, sweeping platoons toward the hungry sea.",
            "Surging tides risk swamping the atoll, slowing units in the rising waters.",
            "Encroaching seas might inundate the ground, hindering troops in the deluge."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Magma-Flooded Colosseum", 
        description: "The Magma-Flooded Colosseum is a shattered relic of ancient glory, its once-proud marble tiers now submerged in rivers of molten magma that glow with a sinister, crimson light. The air is a stifling haze of sulfur and ash, searing lungs and stinging eyes, as embers drift like malevolent stars, burning flesh on contact. Cracked pillars and scorched statues loom precariously, their heat-warped forms threatening to collapse, while the ground trembles with the molten fury below. This infernal arena, steeped in the echoes of past battles, is a crucible where warriors face the unrelenting wrath of liquid fire.", 
        effect: [
            "A surge of molten magma erupts, incinerating units in its blistering flow.",
            "Blazing lava bursts from the arena’s depths, scorching warriors with fiery wrath.",
            "A cascade of molten rock spills forth, burning troops in a searing torrent."
        ], 
        terrainEffect: [
            "Scorching embers may ignite platoons, setting their armor ablaze.",
            "Fiery splashes risk kindling flames, engulfing units in relentless heat.",
            "Glowing cinders might set troops alight, flames clinging to their forms."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Eternal Frost Glacier", 
        description: "The Eternal Frost Glacier is a vast, desolate expanse of unyielding ice, its shimmering surface reflecting a pale, ghostly light under a sky shrouded in perpetual frost. Howling winds whip across the ice, carrying razor-sharp shards that bite like daggers, while hidden crevasses lurk beneath the snow, ready to swallow the unwary into their frozen depths. The air is so cold it crystallizes breath, numbing limbs and dulling senses, as the slick terrain offers no mercy to those who falter. This frozen wasteland is a relentless adversary, where survival is a battle against the glacier’s merciless, eternal chill.", 
        effect: [
            "Icy winds lash the glacier, freezing units in a bone-chilling blast.",
            "Frigid gusts howl across the ice, encasing warriors in numbing frost.",
            "Glacial breezes strike, chilling troops to their core with relentless cold."
        ], 
        terrainEffect: [
            "Biting frost may freeze platoons, stiffening limbs with icy rigidity.",
            "Icy surfaces risk encasing units in chill, slowing their movements.",
            "Frigid air might immobilize troops, hindering them with glacial cold."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Canyon of Echoing Winds", 
        description: "The Canyon of Echoing Winds is a claustrophobic chasm carved through towering sandstone cliffs, where relentless gales howl like tormented spirits, carrying clouds of abrasive dust that sting the eyes. The jagged walls, scarred with ancient carvings, loom oppressively, their loose stones tumbling in the wind’s fury, threatening to crush those below. The uneven canyon floor, strewn with rocky debris, challenges every step, as sudden gusts can hurl warriors against the unyielding stone with bone-shattering force. This desolate gauntlet transforms every sound into a disorienting roar, making the wind itself a formidable foe in this unforgiving arena.", 
        effect: [
            "A ferocious gust slams units against the canyon walls, crushing them with brutal force.",
            "Howling winds hurl warriors into the cliffs, battering them against jagged stone.",
            "A violent blast drives troops into the rocks, smashing them in the canyon’s wrath."
        ], 
        terrainEffect: [
            "Swirling dust storms may disrupt ranged attacks, veiling targets in the wind.",
            "Gusting gales risk throwing arrows off course, hindering precision.",
            "Echoing winds might misalign shots, fouling accuracy in the tempest."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Thunderous Savanna", 
        description: "The Thunderous Savanna is a sprawling grassland ravaged by a torrential monsoon, where dark clouds unleash sheets of rain that transform the earth into a slick, muddy quagmire. The air crackles with the rumble of thunder, while herds of wildebeests stampede in blind panic, their hooves churning the ground into a chaotic mire that shakes with their charge. Scattered acacia trees, lashed by the storm, offer treacherous shelter, their thorns snagging armor as the deluge obscures vision and drowns out commands. This wild expanse is a crucible of nature’s fury, where the relentless onslaught of beasts and rain tests every warrior’s endurance.", 
        effect: [
            "A thundering herd of wildebeests tramples units, crushing them in a frenzied rush.",
            "Stampeding beasts overrun warriors, flattening them beneath pounding hooves.",
            "Panicked wildlife surges, battering troops in a chaotic, unstoppable charge."
        ], 
        terrainEffect: [
            "Frenzied herds may cause stampedes, disrupting platoons with their rampage.",
            "Wildlife surges risk triggering chaos, unsettling units in the storm.",
            "Panicked beasts might spark stampedes, shaking troops with their fury."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Bog of Eternal Stench", 
        description: "The Bog of Eternal Stench is a putrid, festering swamp of black mire, where bubbling pools release a rancid miasma that burns the throat and clouds the mind with its noxious stench. Twisted, skeletal trees rise from the sludge, their gnarled roots forming treacherous snares that clutch at boots, while swarms of venomous flies swarm relentlessly, biting exposed flesh. The ground quakes with hidden gas pockets, unleashing toxic fumes that seep into armor, weakening resolve as the eerie croaks of unseen creatures echo in the distance. This vile quagmire is a test of fortitude, where every breath is a struggle against the bog’s suffocating, poisonous embrace.", 
        effect: [
            "Noxious fumes erupt from the bog, poisoning units with choking vapors.",
            "Toxic gases bubble up, tainting warriors with a sickly, venomous haze.",
            "A burst of fetid mist engulfs troops, sickening them with corrosive blight."
        ], 
        terrainEffect: [
            "Fetid vapors may poison platoons, seeping into their ranks with toxins.",
            "Rancid mire risks envenoming units, weakening them with its foul stench.",
            "Toxic sludge might taint troops, sapping strength with its poisonous grip."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Sahara Mirage Oasis", 
        description: "The Sahara Mirage Oasis is a cruel illusion in a merciless desert, where shimmering pools and verdant palms beckon with false promises, dissolving into blistering sands under a relentless, scorching sun. The air is a dry, searing haze that parches throats and blurs vision, as mirages twist the horizon, luring warriors into traps of heat and delirium. Shifting dunes cling to boots, slowing movement, while the oppressive heat warps metal and saps strength, turning every step into an ordeal. This deceptive haven is a battlefield of endurance, where the desert’s lies test the mind as fiercely as its fiery embrace tests the body.", 
        effect: [
            "Sweltering heat fells units, collapsing them under relentless heatstroke.",
            "Blazing mirages overwhelm warriors, striking them with dehydration’s grip.",
            "Scorching delirium claims troops, toppling them in the oasis’s fiery torment."
        ], 
        terrainEffect: [
            "Flickering mirages may cause disorientation, clouding platoons’ senses.",
            "Illusory visions risk bewildering units, muddling their focus in the heat.",
            "Deceptive images might confuse troops, disorienting them in the desert haze."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Rainforest of Venomous Vines", 
        description: "The Rainforest of Venomous Vines is a dense, steaming jungle where towering trees form a suffocating canopy, their roots entwined with writhing, thorned vines that drip with caustic sap. The air is thick with humidity and the relentless buzz of insects, while the ground, carpeted with rotting leaves, hides treacherous pits that swallow the unwary. Sudden downpours turn paths to slick mud, hindering movement, as the vines lash out with predatory malice, their poison searing flesh with every touch. This verdant labyrinth is a living predator, where nature’s wrath tests warriors against its toxic, entangling embrace.", 
        effect: [
            "Venomous vines lash out, poisoning units with their burning, caustic sap.",
            "Thorny tendrils strike, tainting warriors with venom that sears their flesh.",
            "Writhing creepers inject troops with toxin, sickening them in the jungle’s grip."
        ], 
        terrainEffect: [
            "Tangled vines may entangle platoons, binding them in the rainforest’s snare.",
            "Creeping tendrils risk snaring units, hindering movement in the dense jungle.",
            "Thorny growths might ensnare troops, slowing them in the verdant maze."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Arctic Iceberg Drift", 
        description: "The Arctic Iceberg Drift is a perilous seascape of towering icebergs adrift in a freezing, slate-gray ocean, their jagged peaks glinting under a pale, unyielding sky. The ice underfoot is slick and treacherous, cracking with ominous groans that signal sudden collapses into the frigid waters below, where currents pull with merciless force. The air bites with a bone-chilling cold, frosting armor and numbing fingers, while icy mists swirl, stinging eyes and obscuring vision. This floating graveyard of ice demands agility and endurance, as a single misstep can plunge warriors into a frozen, watery tomb.", 
        effect: [
            "Units slip on slick ice, plunging into the icy waters’ chilling embrace.",
            "Cracking bergs give way, casting warriors into the freezing ocean depths.",
            "Unstable ice shatters, dropping troops into the drift’s frigid currents."
        ], 
        terrainEffect: [
            "Glacial cold may freeze platoons, numbing their limbs with icy frost.",
            "Icy mists risk encasing units in chill, slowing their movements.",
            "Frigid waves might stiffen troops, hindering them with arctic cold."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Wraith-Infested Moor", 
        description: "The Wraith-Infested Moor is a desolate, fog-shrouded wasteland of sodden earth, where gnarled, leafless trees loom like specters, their twisted forms barely visible in the dim, ghostly light. The air is heavy with a clammy chill, carrying the eerie wail of unseen spirits that flicker through the mist, their ethereal touch draining the warmth from living flesh. The boggy ground sucks at boots, hiding quagmires that threaten to trap the unwary, while the oppressive silence amplifies every rustle, fraying nerves. This haunted moor is a realm of dread, where the dead’s spectral presence turns courage to terror with every step.", 
        effect: [
            "Wraiths glide from the fog, draining units with their chilling, spectral touch.",
            "Ghostly shades sap warriors, weakening them with ethereal malice.",
            "Phantasmal spirits clutch troops, siphoning life in the moor’s haunted mist."
        ], 
        terrainEffect: [
            "Eerie wails may frighten platoons, sowing dread in their ranks.",
            "Spectral visions risk unnerving units, shaking their resolve with fear.",
            "Haunting presences might terrify troops, disrupting courage in the fog."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Asteroid Field Arena", 
        description: "The Asteroid Field Arena is a chaotic void of tumbling, jagged rocks suspended in a star-strewn expanse, where the silence of the cosmos belies the deadly dance of celestial debris. Massive asteroids collide with bone-rattling force, their pitted surfaces offering treacherous footing as smaller fragments whirl unpredictably, threatening to crush all in their path. The airless vacuum amplifies the eerie glow of distant stars, casting stark shadows that confuse the eye, while the weightless environment demands precise movement to avoid drifting into oblivion. This extraterrestrial battlefield is a crucible of agility and instinct, where the cosmos itself is an unrelenting adversary.", 
        effect: [
            "A massive asteroid slams into units, crushing them with cosmic force.",
            "Jagged meteors plummet through the void, pulverizing warriors in their path.",
            "Whirling debris smashes troops, battering them in the asteroid field’s chaos."
        ], 
        terrainEffect: [
            "Unstable rocks may cause explosions, detonating amidst platoons.",
            "Colliding asteroids risk triggering blasts, erupting in cosmic chaos.",
            "Shifting debris might spark bursts, shattering the battlefield."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Tsunami-Stricken Beach", 
        description: "The Tsunami-Stricken Beach is a ravaged coastline where towering waves crash with apocalyptic fury, churning the sand into a treacherous mire littered with splintered driftwood and shattered shells. The air is thick with salt spray and the roar of the ocean, drowning out cries as the ground trembles with the approach of each monstrous surge. Jagged rocks protrude from the surf, their surfaces slick with algae, offering perilous footing as the relentless tide threatens to sweep warriors into the deep. This storm-lashed shore is a battleground of elemental wrath, where the sea’s unyielding power tests every combatant’s resolve.", 
        effect: [
            "A towering tsunami wave crashes ashore, sweeping units into the raging sea.",
            "Surging tides engulf warriors, dragging them beneath the churning waters.",
            "A colossal breaker slams the beach, washing troops into the ocean’s depths."
        ], 
        terrainEffect: [
            "Crashing waves may flood the terrain, hindering platoons’ movements.",
            "Surging seas risk inundating the shore, slowing units in the deluge.",
            "Relentless tides might swamp the ground, impeding troops’ advance."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Floating Crystal Isles", 
        description: "The Floating Crystal Isles are a surreal archipelago of glowing, crystalline platforms suspended in a shimmering void, their radiant surfaces refracting light into dazzling, disorienting patterns. Fragile bridges of translucent crystal connect the isles, creaking underfoot and threatening to shatter, plunging warriors into the abyss below. The air hums with a faint, harmonic resonance, charged with latent magical energy that sparks erratically, while the weightless environment demands careful movement to avoid drifting astray. This ethereal battlefield is a delicate, deadly marvel, where beauty and peril intertwine, testing agility and precision.", 
        effect: [
            "A crystal bridge shatters, dropping units into the void’s endless depths.",
            "Fragile spans collapse, casting warriors from the isles’ radiant heights.",
            "Cracking crystal pathways break, plunging troops into the shimmering abyss."
        ], 
        terrainEffect: [
            "Unstable platforms may destabilize footing, unbalancing platoons.",
            "Shifting crystals risk unsteadying units, hindering their stance.",
            "Fragile isles might disrupt balance, shaking troops on radiant ground."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Acidic Geyser Field", 
        description: "The Acidic Geyser Field is a barren, scorched plain pocked with bubbling craters, where corrosive acid geysers erupt with hissing fury, spewing caustic mists that burn the lungs and dissolve metal. The ground is a patchwork of cracked earth and sizzling pools, their surfaces shimmering with a sickly green glow, offering no safe path as the air reeks of acrid fumes. Jagged, acid-eaten rocks provide treacherous cover, their edges sharp enough to cut through armor, while sudden tremors signal impending eruptions. This toxic wasteland is a crucible of resilience, where every moment is a battle against the relentless corrosion of the land itself.", 
        effect: [
            "A geyser of corrosive acid erupts, melting units in its searing spray.",
            "Caustic fountains burst forth, dissolving warriors with burning mist.",
            "A surge of acidic sludge douses troops, eating through flesh and armor."
        ], 
        terrainEffect: [
            "Acidic vapors may corrode armor, weakening platoons’ defenses.",
            "Toxic mists risk eroding gear, degrading units’ protection.",
            "Caustic fumes might eat at armor, sapping troops’ resilience."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Cursed Pyramid Interior", 
        description: "The Cursed Pyramid Interior is a labyrinth of shadowed stone corridors, where ancient hieroglyphs pulse with a malevolent glow, and the air is thick with the dust of centuries and the faint stench of decay. Shambling mummies, bound in tattered wrappings, lurk in the darkness, their hollow moans echoing through the halls as they emerge from hidden alcoves to ensnare the living. Trap-laden floors conceal pits and blades, while the oppressive weight of the pyramid’s curse frays nerves, making every shadow a potential threat. This tomb of forgotten kings is a gauntlet of dread, where the undead guard their secrets with relentless, cursed fury.", 
        effect: [
            "Shambling mummies emerge, trapping units in their unyielding, bandaged grip.",
            "Ancient undead lunge from alcoves, ensnaring warriors with cursed strength.",
            "Wraith-bound mummies seize troops, binding them in the pyramid’s dark embrace."
        ], 
        terrainEffect: [
            "Eerie curses may summon undead, haunting platoons with spectral foes.",
            "Malevolent glyphs risk conjuring wraiths, unsettling units with dark magic.",
            "Ancient magics might awaken shades, disturbing troops with ghostly wrath."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Hurricane-Ravaged Peninsula", 
        description: "The Hurricane-Ravaged Peninsula juts into a roiling, storm-tossed sea, where a merciless hurricane drives torrents of rain and howling winds that tear at flesh and armor. The rocky shore is strewn with shattered trees and debris, their jagged edges snagging boots as the ground turns to a slick, muddy quagmire under the deluge. Towering waves crash against the cliffs, sending sprays of salt water that blind and unbalance, while flying wreckage hurtles through the air, a deadly barrage in the storm’s chaos. This tempest-lashed battleground is a trial of endurance, where nature’s fury is as lethal as any blade.", 
        effect: [
            "Flying debris slams into units, striking them with the hurricane’s wrath.",
            "Whirling wreckage crashes down, battering warriors in the storm’s fury.",
            "Splintered timbers hurtle through the air, smashing troops in the tempest."
        ], 
        terrainEffect: [
            "Gusting winds may disrupt balance, unsteadying platoons in the storm.",
            "Driving rain risks throwing off footing, hindering units’ stability.",
            "Chaotic gales might unbalance troops, shaking their stance in the hurricane."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Obsidian Shard Plains", 
        description: "The Obsidian Shard Plains are a desolate expanse of gleaming black stone, where razor-sharp obsidian shards jut from the ground like the teeth of some ancient beast, glinting under a blood-red sky. The air is heavy with the acrid scent of volcanic ash, stinging eyes and throats, as the uneven terrain slices through boots and armor with every misstep. Scattered pools of bubbling tar add to the peril, their sticky surfaces trapping the unwary, while the ground trembles with distant seismic rumbles, hinting at the land’s volatile heart. This jagged, unforgiving plain is a crucible of precision, where a single stumble can draw blood and doom.", 
        effect: [
            "Razor-sharp obsidian shards slice units, cutting them with merciless precision.",
            "Jagged black stones tear into warriors, wounding them with cruel edges.",
            "A field of glassy blades gashes troops, drawing blood in the plains’ grip."
        ], 
        terrainEffect: [
            "Sharp obsidian may cause bleeding, wounding platoons with deep cuts.",
            "Jagged shards risk lacerating units, sapping strength with each gash.",
            "Glassy blades might slice troops, draining them with persistent wounds."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Bioluminescent Reef", 
        description: "The Bioluminescent Reef is a mesmerizing underwater realm where vibrant corals glow with eerie, pulsating light, casting shifting patterns across the ocean floor. Electric eels slither through the reef’s tangled spires, their sinuous forms sparking with volatile energy, ready to unleash jolts that ripple through the water. The currents swirl unpredictably, tugging at limbs and clouding vision with clouds of bioluminescent plankton, while the jagged coral edges threaten to snag armor. This submerged battlefield is a dazzling yet deadly spectacle, where the beauty of the reef conceals a shocking peril that tests every warrior’s resilience.", 
        effect: [
            "Electric eels lash out, shocking units with jolts of searing energy.",
            "Charged serpents strike, electrocuting warriors in a burst of aquatic lightning.",
            "Sparking currents surge, stunning troops with the reef’s volatile power."
        ], 
        terrainEffect: [
            "Electric pulses may stun platoons, disrupting their focus with shocking force.",
            "Charged waters risk dazing units, staggering them with sudden jolts.",
            "Bioluminescent sparks might shock troops, leaving them reeling in the reef."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Frostbitten Taiga", 
        description: "The Frostbitten Taiga is a frozen wilderness of snow-laden pines, their branches sagging under the weight of ice, where the air is a biting chill that freezes breath into clouds of frost. Packs of ravenous wolves prowl the shadows, their glowing eyes and guttural howls piercing the silence, ready to ambush the unwary with savage ferocity. The snow-covered ground conceals hidden roots and icy patches, threatening to trip or immobilize warriors, while the relentless cold seeps through armor, numbing limbs. This bleak, primal forest is a battleground of survival, where the taiga’s predators and freezing grip challenge every step.", 
        effect: [
            "A pack of wolves lunges from the snow, tearing into units with savage fangs.",
            "Feral predators pounce, mauling warriors with relentless, primal fury.",
            "Howling beasts ambush troops, rending them in the taiga’s frozen depths."
        ], 
        terrainEffect: [
            "Icy winds may freeze platoons, stiffening their limbs with biting frost.",
            "Snow-packed ground risks chilling units, slowing their movements in the cold.",
            "Frigid air might encase troops in ice, hindering them in the taiga’s chill."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Phantom Fog Delta", 
        description: "The Phantom Fog Delta is a sprawling river delta cloaked in a thick, ghostly fog that swirls with an unnatural weight, muffling sounds and obscuring the horizon. Twisted mangroves rise from the brackish water, their roots forming treacherous snares that clutch at boots, while hidden sinkholes lurk beneath the murky surface, ready to trap the careless. The air is damp and heavy, carrying the faint scent of decay, as the fog plays tricks on the eyes, making every shadow a potential threat. This eerie, labyrinthine delta is a realm of disorientation, where unseen dangers and the oppressive mist test warriors’ resolve.", 
        effect: [
            "Hidden snares spring shut, trapping units in the delta’s tangled roots.",
            "Concealed traps ensnare warriors, binding them in the fog’s murky grip.",
            "Sudden pitfalls seize troops, catching them in the delta’s treacherous mire."
        ], 
        terrainEffect: [
            "Swirling fog may reduce visibility, cloaking the delta in a ghostly haze.",
            "Thick mists risk obscuring sight, veiling enemies in the phantom shroud.",
            "Ethereal vapors might blur the field, hindering vision in the foggy expanse."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Comet Impact Zone", 
        description: "The Comet Impact Zone is a scorched, crater-pocked wasteland where the earth still smolders from a celestial collision, its surface littered with glowing fragments that pulse with residual heat. The air is thick with acrid smoke and the crackle of fiery aftershocks, which erupt unpredictably, casting an ominous red glow across the shattered terrain. Jagged, heat-warped rocks offer unstable footing, while pockets of superheated ash threaten to ignite with the slightest disturbance. This apocalyptic battlefield is a crucible of chaos, where the comet’s lingering wrath challenges warriors to endure its fiery, destructive legacy.", 
        effect: [
            "Fiery aftershocks erupt, burning units with searing, celestial flames.",
            "Blazing tremors ignite, scorching warriors in a surge of molten heat.",
            "Smoldering craters flare, engulfing troops in the comet’s fiery wrath."
        ], 
        terrainEffect: [
            "Glowing embers may ignite platoons, setting their gear ablaze.",
            "Fiery ash risks kindling flames, engulfing units in burning chaos.",
            "Scorching debris might set troops alight, flames clinging to their forms."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Monsoon Flooded Valley", 
        description: "The Monsoon Flooded Valley is a lush, verdant basin transformed into a churning morass by relentless monsoon rains, where swollen rivers overflow, turning the ground into a treacherous quagmire. The air is heavy with the scent of wet earth and the roar of cascading water, as torrents sweep away loose debris, threatening to drag warriors into their depths. Overhanging cliffs, slick with moss, loom above, their unstable edges crumbling under the deluge, while the muddy terrain clings to boots, slowing every step. This waterlogged valley is a battleground of elemental fury, where the floods’ unyielding power tests endurance and agility.", 
        effect: [
            "Raging floods surge through the valley, drowning units in their relentless tide.",
            "Swollen rivers sweep warriors away, dragging them into the churning depths.",
            "A torrent of muddy water engulfs troops, washing them in the monsoon’s wrath."
        ], 
        terrainEffect: [
            "Surging waters may flood the terrain, hindering platoons’ movements.",
            "Rushing streams risk inundating the valley, slowing units in the deluge.",
            "Churning floods might swamp the ground, impeding troops’ advance."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Skybound Lightning Spires", 
        description: "The Skybound Lightning Spires are towering, jagged pillars of storm-scarred rock that pierce the roiling clouds, their peaks crackling with the raw energy of ceaseless lightning strikes. The air hums with electric tension, heavy with the scent of ozone, as bolts of blinding light arc unpredictably, illuminating the spires in stark, fleeting flashes. The rocky ground, littered with charred debris, offers treacherous footing, while the constant rumble of thunder drowns out commands, sowing chaos. This electrified battlefield is a crucible of reflexes, where the sky’s wrath delivers swift, shocking judgment to those who linger.", 
        effect: [
            "A bolt of lightning crashes down, electrocuting units in a blinding flash.",
            "Sizzling arcs strike from the spires, shocking warriors with searing energy.",
            "Thunderous lightning splits the sky, frying troops in its electric fury."
        ], 
        terrainEffect: [
            "Electric surges may stun platoons, staggering them with shocking force.",
            "Charged air risks dazing units, disrupting their focus with sudden jolts.",
            "Storm-born sparks might shock troops, leaving them reeling in the tempest."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Necrotic Marshes", 
        description: "The Necrotic Marshes are a blighted, festering mire where stagnant pools of dark water reflect a sickly, greenish glow, and the air reeks of decay, thick with the buzz of carrion flies. Shambling undead lurk beneath the surface, their skeletal hands clawing from the muck, ready to drag the living into the marsh’s cursed depths. The boggy terrain, tangled with rotting roots, sucks at boots, while faint moans echo through the mist, chilling the soul. This unhallowed swamp is a graveyard of despair, where the restless dead make every step a perilous encounter with the abyss.", 
        effect: [
            "Undead hands burst from the mire, pulling units into the marsh’s cursed depths.",
            "Skeletal wraiths drag warriors under, ensnaring them in the necrotic muck.",
            "Ghastly claws seize troops, yanking them beneath the swamp’s dark surface."
        ], 
        terrainEffect: [
            "Foul curses may summon undead, haunting platoons with spectral foes.",
            "Necrotic mists risk conjuring wraiths, unsettling units with dark magic.",
            "Unholy waters might awaken shades, disturbing troops with ghostly wrath."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Infernal Forge Ruins", 
        description: "The Infernal Forge Ruins are a crumbling expanse of blackened stone and twisted metal, where molten pools of glowing steel bubble and hiss, casting an ominous red light across the shattered remnants of an ancient foundry. The air is a stifling inferno, thick with the acrid tang of scorched iron, as sparks and embers drift, searing flesh on contact. Cracked anvils and rusted machinery litter the ground, their jagged edges snagging armor, while the unstable earth trembles with the forge’s lingering heat. This fiery wasteland is a crucible of endurance, where the molten legacy of the forge tests warriors against its burning wrath.", 
        effect: [
            "Molten metal splashes erupt, burning units with searing, liquid fire.",
            "Blazing steel surges forth, scorching warriors in a fiery deluge.",
            "A cascade of glowing slag douses troops, incinerating them in the forge’s heat."
        ], 
        terrainEffect: [
            "Fiery embers may ignite platoons, setting their gear ablaze.",
            "Scorching sparks risk kindling flames, engulfing units in burning chaos.",
            "Glowing slag might set troops alight, flames clinging to their forms."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Tidal Maelstrom Bay", 
        description: "The Tidal Maelstrom Bay is a turbulent coastal inlet where colossal waves crash against jagged cliffs, their spray mingling with the salty tang of the sea, creating a chaotic symphony of water and wind. The rocky shore, strewn with seaweed and broken shells, is slick and treacherous, offering no stable footing as the tide surges with relentless force. The air roars with the fury of the ocean, drowning out commands, while hidden undertows lurk beneath the surf, ready to pull warriors into the depths. This storm-ravaged bay is a battleground of aquatic might, where the maelstrom’s power challenges every combatant’s resolve.", 
        effect: [
            "A towering wave crashes, washing units into the bay’s churning depths.",
            "Surging tides sweep warriors away, dragging them beneath the maelstrom.",
            "A colossal breaker slams the shore, pulling troops into the ocean’s grasp."
        ], 
        terrainEffect: [
            "Raging waves may flood the terrain, hindering platoons’ movements.",
            "Surging seas risk inundating the bay, slowing units in the deluge.",
            "Churning tides might swamp the shore, impeding troops’ advance."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Shattered Glass Desert", 
        description: "The Shattered Glass Desert is a surreal wasteland of gleaming, razor-sharp glass shards, where the ground sparkles like a fractured mirror under a merciless sun that amplifies the heat to unbearable levels. The air shimmers with a searing haze, carrying the faint tinkling of shifting fragments, as each step risks deep cuts that bleed freely. Towering dunes of pulverized glass shift unpredictably, threatening to collapse and bury warriors, while focused beams of sunlight ignite the terrain with sudden, blinding intensity. This cruel, reflective expanse is a battlefield of precision, where the desert’s dazzling beauty conceals a deadly, cutting edge.", 
        effect: [
            "Focused sunlight beams ignite units, incinerating them in a blinding flash.",
            "Searing rays flare across the glass, burning warriors with fiery intensity.",
            "Concentrated solar blasts scorch troops, engulfing them in radiant heat."
        ], 
        terrainEffect: [
            "Razor-sharp shards may cause bleeding, wounding platoons with deep cuts.",
            "Jagged glass risks lacerating units, sapping strength with each gash.",
            "Glassy fragments might slice troops, draining them with persistent wounds."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Venomous Serpent Pit", 
        description: "The Venomous Serpent Pit is a dark, writhing chasm filled with coiling, hissing serpents, their scales glinting in the dim light as they slither through piles of bleached bones and tangled roots. The air is thick with the musky scent of venom and the incessant rustle of scales, while the uneven ground, littered with shed skins, conceals hidden burrows from which the snakes strike with deadly precision. Each step risks disturbing a nest, unleashing a flurry of fangs that deliver searing poison, as the pit’s oppressive heat saps strength. This reptilian nightmare is a crucible of caution, where the serpents’ venomous wrath tests every warrior’s nerve.", 
        effect: [
            "Venomous serpents strike, poisoning units with their searing, toxic fangs.",
            "Coiling vipers lash out, tainting warriors with venom that burns their veins.",
            "Hissing snakes sink teeth into troops, sickening them with deadly poison."
        ], 
        terrainEffect: [
            "Hidden serpents may poison platoons, injecting toxins with their bites.",
            "Venomous coils risk envenoming units, weakening them with searing venom.",
            "Slithering vipers might taint troops, sapping strength with their poison."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Polar Vortex Plains", 
        description: "The Polar Vortex Plains are a desolate, windswept expanse under the grip of a merciless polar vortex, where swirling snow and ice create a blinding maelstrom that obscures the horizon. The ground is a frozen crust, cracking underfoot to reveal hidden ice traps, while the air is so cold it sears the lungs, frosting armor and numbing limbs with every breath. Jagged, ice-encrusted rocks offer scant cover, their surfaces slick and treacherous, as the vortex’s relentless winds threaten to hurl warriors into the void. This frozen battlefield is a test of endurance, where the vortex’s icy fury is as deadly as any foe.", 
        effect: [
            "The polar vortex unleashes a freezing blast, chilling units to their core.",
            "Icy winds surge across the plains, encasing warriors in numbing frost.",
            "A frigid maelstrom strikes, freezing troops in the vortex’s relentless grip."
        ], 
        terrainEffect: [
            "Biting cold may freeze platoons, stiffening their limbs with icy frost.",
            "Icy gusts risk chilling units, slowing their movements in the vortex.",
            "Frigid air might encase troops, hindering them with polar chill."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Ethereal Mist Highlands", 
        description: "The Ethereal Mist Highlands are a rugged, mist-shrouded range of jagged peaks, where ghostly vapors swirl around ancient, weathered stones, casting an eerie glow that distorts perception. The air is cold and damp, carrying the faint whispers of unseen spirits that drift through the fog, their spectral forms unsettling the living with their haunting presence. The rocky terrain, slick with dew and strewn with loose shale, threatens to send warriors tumbling over sheer cliffs, while the oppressive mist muffles sound, amplifying dread. This spectral battlefield is a realm of fear, where the spirits’ chilling influence makes every step a perilous gamble.", 
        effect: [
            "Spectral spirits wail, scaring units off cliffs in a panic-stricken flight.",
            "Ethereal wraiths drive warriors over edges, terrifying them with ghostly dread.",
            "Phantom shades push troops toward precipices, sowing fear in the misty heights."
        ], 
        terrainEffect: [
            "Ghostly whispers may frighten platoons, sowing panic in their ranks.",
            "Spectral mists risk unnerving units, shaking their resolve with fear.",
            "Ethereal visions might terrify troops, disrupting courage in the fog."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
    },
    { 
        name: "Raging River Rapids", 
        description: "The Raging River Rapids are a tumultuous stretch of whitewater where a roaring river carves through a rocky gorge, its currents surging with unrelenting force, spraying mist that obscures vision. The jagged, moss-slick boulders lining the banks offer treacherous footing, as the ground trembles with the river’s power, threatening to sweep warriors into its depths. The air is filled with the deafening crash of water and the sharp tang of spray, drowning out commands and heightening the chaos of battle. This wild, aquatic battlefield is a trial of balance and strength, where the rapids’ fury is a relentless adversary.", 
        effect: [
            "Raging currents sweep units away, dragging them into the river’s churning depths.",
            "Surging rapids seize warriors, pulling them beneath the whitewater’s wrath.",
            "A torrent of water engulfs troops, washing them in the river’s relentless flow."
        ], 
        terrainEffect: [
            "Crashing waves may flood the terrain, hindering platoons’ movements.",
            "Surging currents risk inundating the gorge, slowing units in the deluge.",
            "Churning rapids might swamp the ground, impeding troops’ advance."
        ], 
        damageRange: [1, 5], 
        risk: getRandomRiskPercentage() 
      }
    ] 
};

let selectedBattlefield = null;
let userAssets = [];
let opponentAssets = [];
let xogePrice = 0.000001;

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function getRandomRiskPercentage() {
    return Math.floor(Math.random() * 23) + 5;
}

const priceCache = new Map();

async function getPoolPriceInXrp(assetName, hex, issuer) {
    const cacheKey = `${assetName}:${hex}:${issuer}`;
    if (priceCache.has(cacheKey)) {
        return priceCache.get(cacheKey);
    }

    try {
        if (assetName === "XRP") {
            priceCache.set(cacheKey, 1);
            return 1;
        }

        await ensureConnectedWithRetry();

        
        const lpToken = globalLPTokens?.find(lp => lp.currency === hex && lp.issuer === issuer && lp.lpName === assetName);
        if (lpToken) {
            if (!lpToken.balance || lpToken.balance <= 0) {
                console.warn(`Invalid LP token balance for ${assetName}: ${lpToken.balance}`);
                return null; 
            }

            let ammObj;
            try {
                const ammObjects = await throttleRequest(() =>
                    client.request({
                        command: 'account_objects',
                        account: issuer,
                        type: 'amm',
                        ledger_index: 'current'
                    })
                );
                ammObj = ammObjects.result.account_objects.find(obj => 
                    obj.LedgerEntryType === 'AMM' && 
                    obj.LPTokenBalance?.currency === hex && 
                    obj.LPTokenBalance?.issuer === issuer
                );
                if (!ammObj) {
                    console.warn(`No AMM object found for LP token ${assetName} (${hex}/${issuer})`);
                    return null; 
                }
            } catch (error) {
                console.warn(`Error fetching AMM object for ${assetName} (${hex}/${issuer}): ${error.message}`);
                return null; 
            }

            let lpTokenSupply = typeof ammObj.LPTokenBalance === 'object' 
                ? parseFloat(ammObj.LPTokenBalance.value) 
                : parseFloat(ammObj.LPTokenBalance);
            if (isNaN(lpTokenSupply) || lpTokenSupply <= 0) {
                console.warn(`Invalid LP token supply for ${assetName}: ${lpTokenSupply}`);
                return null; 
            }

            const asset1Data = ammObj.Asset?.currency === 'XRP'
                ? { currency: 'XRP', issuer: '', name: 'XRP' }
                : { 
                    currency: ammObj.Asset.currency, 
                    issuer: ammObj.Asset.issuer, 
                    name: xrpl.convertHexToString(ammObj.Asset.currency).replace(/\0/g, '') || 'Unknown' 
                };
            const asset2Data = ammObj.Asset2?.currency === 'XRP'
                ? { currency: 'XRP', issuer: '', name: 'XRP' }
                : { 
                    currency: ammObj.Asset2.currency, 
                    issuer: ammObj.Asset2.issuer, 
                    name: xrpl.convertHexToString(ammObj.Asset2.currency).replace(/\0/g, '') || 'Unknown' 
                };

            let ammInfo;
            try {
                ammInfo = await throttleRequest(() =>
                    client.request({
                        command: 'amm_info',
                        asset: asset1Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset1Data.currency, issuer: asset1Data.issuer },
                        asset2: asset2Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset2Data.currency, issuer: asset2Data.issuer },
                        ledger_index: 'current'
                    })
                );
            } catch (error) {
                try {
                    ammInfo = await throttleRequest(() =>
                        client.request({
                            command: 'amm_info',
                            asset: asset2Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset2Data.currency, issuer: asset2Data.issuer },
                            asset2: asset1Data.currency === 'XRP' ? { currency: 'XRP' } : { currency: asset1Data.currency, issuer: asset1Data.issuer },
                            ledger_index: 'current'
                        })
                    );
                } catch (secondaryError) {
                    console.warn(`Failed to fetch AMM info for LP token ${assetName} (${hex}/${issuer}): ${secondaryError.message}`);
                    return null; 
                }
            }

            if (!ammInfo.result.amm || !ammInfo.result.amm.amount || !ammInfo.result.amm.amount2) {
                console.warn(`No valid AMM pool data for LP token ${assetName} (${hex}/${issuer})`);
                return null; 
            }

            const amount1 = ammInfo.result.amm.amount;
            const amount2 = ammInfo.result.amm.amount2;
            let poolXrp = typeof amount1 === 'string' ? parseFloat(xrpl.dropsToXrp(amount1)) : parseFloat(xrpl.dropsToXrp(amount2));
            let poolToken = typeof amount1 === 'string' ? parseFloat(amount2.value) : parseFloat(amount1.value);

            if (isNaN(poolXrp) || isNaN(poolToken) || poolToken === 0) {
                console.warn(`Invalid AMM pool data for LP token ${assetName}: poolXrp=${poolXrp}, poolToken=${poolToken}`);
                return null; 
            }

            let tokenPriceInXrp;
            if (asset1Data.currency === 'XRP') {
                tokenPriceInXrp = poolXrp / poolToken;
            } else {
                tokenPriceInXrp = poolToken / poolXrp;
                poolXrp = parseFloat(xrpl.dropsToXrp(amount1 === 'string' ? amount2 : amount1));
                poolToken = parseFloat(amount1 === 'string' ? amount1.value : amount2.value);
            }

            const totalPoolValueXrp = poolXrp + (poolToken * tokenPriceInXrp);
            const lpShare = lpToken.balance / lpTokenSupply;
            if (isNaN(lpShare) || lpShare < 0 || lpShare > 1) {
                console.warn(`Invalid LP share for ${assetName}: ${lpShare} (balance=${lpToken.balance}, supply=${lpTokenSupply})`);
                return null; 
            }

            const lpValueInXrp = totalPoolValueXrp * lpShare;
            const priceInXrp = lpValueInXrp / lpToken.balance;

            if (isNaN(priceInXrp) || priceInXrp <= 0) {
                console.warn(`Invalid LP price for ${assetName}: ${priceInXrp}`);
                return null; 
            }

            priceCache.set(cacheKey, priceInXrp);
            return priceInXrp;
        }

        
        const baseAssetData = { currency: "XRP" };
        const quoteAssetData = { currency: hex, issuer: issuer };

        let priceInXrp;
        try {
            let ammInfo;
            try {
                ammInfo = await throttleRequest(() =>
                    client.request({
                        command: "amm_info",
                        asset: baseAssetData,
                        asset2: quoteAssetData,
                        ledger_index: "current"
                    })
                );
            } catch (error) {
                ammInfo = await throttleRequest(() =>
                    client.request({
                        command: "amm_info",
                        asset: quoteAssetData,
                        asset2: baseAssetData,
                        ledger_index: "current"
                    })
                );
            }

            if (ammInfo.result.amm && ammInfo.result.amm.amount && ammInfo.result.amm.amount2) {
                const amount1 = ammInfo.result.amm.amount;
                const amount2 = ammInfo.result.amm.amount2;
                let poolXrp, poolToken;

                if (ammInfo.result.amm.asset.currency === "XRP") {
                    poolXrp = parseFloat(xrpl.dropsToXrp(amount1));
                    poolToken = parseFloat(amount2.value);
                } else {
                    poolXrp = parseFloat(xrpl.dropsToXrp(amount2));
                    poolToken = parseFloat(amount1.value);
                }

                if (!isNaN(poolXrp) && !isNaN(poolToken) && poolToken !== 0) {
                    priceInXrp = poolXrp / poolToken;
                    if (assetName === "Xoge") xogePrice = priceInXrp;
                    priceCache.set(cacheKey, priceInXrp);
                    return priceInXrp;
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch AMM info for ${assetName} (${hex}/${issuer}): ${error.message}`);
        }

        
        try {
            const bookOffers = await throttleRequest(() =>
                client.request({
                    command: "book_offers",
                    taker_gets: { currency: "XRP" },
                    taker_pays: { currency: hex, issuer: issuer },
                    ledger_index: "current",
                    limit: 10
                })
            );
            const offers = bookOffers.result.offers;
            if (offers && offers.length > 0) {
                const bestOffer = offers[0];
                const xrpAmount = parseFloat(xrpl.dropsToXrp(bestOffer.taker_gets));
                const tokenAmount = parseFloat(bestOffer.taker_pays.value);
                if (!isNaN(xrpAmount) && !isNaN(tokenAmount) && tokenAmount !== 0) {
                    priceInXrp = xrpAmount / tokenAmount;
                    if (assetName === "Xoge") xogePrice = priceInXrp;
                    priceCache.set(cacheKey, priceInXrp);
                    return priceInXrp;
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch order book for ${assetName} (${hex}/${issuer}): ${error.message}`);
        }

        console.warn(`No valid price data for ${assetName} (${hex}/${issuer})`);
        return null; 
    } catch (error) {
        console.error(`Error fetching price for ${assetName} (${hex}/${issuer}): ${error.message}`);
        return null; 
    }
}


async function ensureConnectedWithRetry(maxRetries = 10, delayMs = 3000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!client || !client.isConnected()) {
                await connectWebSocket();
            }
            await ensureConnected();
            if (client && client.isConnected()) {
                return true;
            }
        } catch (error) {
            
            if (attempt === maxRetries) {
                throw new Error(`Failed to connect to XRPL after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return false;
}

async function calculateUnitStats(asset) {
    let balance;
    if (asset.name === "XRP") {
        balance = parseFloat(asset.balance.split('<br>')[0].replace('Total: ', '').replace(' XRP', '')) * 1000000; // Convert XRP to drops
    } else {
        balance = parseFloat(asset.balance);
    }
    if (isNaN(balance) || balance <= 0) {
        console.warn(`Invalid balance for ${asset.name}: ${asset.balance}`);
        return null;
    }

    let xrpValue;
    if (asset.name === "XRP") {
        xrpValue = balance / 1000000;
    } else if (asset.isLPToken) {
        xrpValue = balance / 1000000;
    } else {
        xrpValue = balance / 2500000;
    }

    if (isNaN(xrpValue) || xrpValue <= 0) {
        console.warn(`Invalid XRP value for ${asset.name}: balance=${balance}`);
        return null;
    }

    const troops = Math.ceil(xrpValue);
    if (troops <= 0) return null;
    const power = troops * 10;
    const hpPerTroop = 50;
    const damagePerTroop = 200;

    return {
        ...asset,
        poolPrice: asset.name === "XRP" ? 1 : (asset.isLPToken ? 0.1 : 0.04), // Store fixed rates for reference
        troops,
        power,
        hpPerTroop,
        damagePerTroop,
        isFallback: false
    };
}

async function generateArmy(asset) {
    const stats = await calculateUnitStats(asset);
    if (!stats || stats.troops < 5) {
        console.warn(`Cannot generate army for ${asset.name}: insufficient troops or invalid stats`);
        return null;
    }
    const maxPlatoons = Math.min(3, Math.max(2, Math.floor(stats.troops / 10)));
    const numPlatoons = Math.min(Math.floor(Math.random() * 2) + 2, maxPlatoons, stats.troops);
    const platoons = [];
    const usedClasses = new Set();

    for (let i = 0; i < numPlatoons; i++) {
        let platoonClass;
        do {
            platoonClass = BattleConfig.classes[Math.floor(Math.random() * BattleConfig.classes.length)];
        } while (usedClasses.has(platoonClass));
        usedClasses.add(platoonClass);
        const compatibleWeapons = BattleConfig.weapons.filter(w => w.classes.includes(platoonClass));
        const compatibleLegendaryWeapons = BattleConfig.legendaryWeapons.filter(w => w.classes.includes(platoonClass));
        const compatibleEpicWeapons = BattleConfig.epicWeapons.filter(w => w.classes.includes(platoonClass));
        const weapon = compatibleWeapons[Math.floor(Math.random() * compatibleWeapons.length)] || { name: "Fists", damageBonus: 0, description: "Bare hands" };
        const spells = BattleConfig.spells.filter(s => s.classes.includes(platoonClass));
        const ancientSpells = BattleConfig.ancientSpells.filter(s => s.classes.includes(platoonClass));
        const forsakenRuneSpells = BattleConfig.forsakenRuneSpells.filter(s => s.classes.includes(platoonClass));
        const platoonTroops = Math.floor(stats.troops / numPlatoons) + (i < stats.troops % numPlatoons ? 1 : 0);
        platoons.push({
            class: platoonClass,
            troopsAlive: platoonTroops,
            initialTroops: platoonTroops,
            hpPerTroop: stats.hpPerTroop * getClassHpModifier(platoonClass),
            damagePerTroop: stats.power / stats.troops,
            weapon,
            legendaryWeapons: compatibleLegendaryWeapons,
            epicWeapons: compatibleEpicWeapons,
            spells,
            ancientSpells,
            forsakenRuneSpells,
            conditions: []
        });
    }
    return { asset: asset.name, platoons, totalPower: stats.power, initialPower: stats.power };
}

function getClassHpModifier(className) {
    switch (className) {
        case "Barbarian": return 2.0;
        case "Berserker": return 2.0;
        case "Fighter": return 1.6;
        case "Paladin": return 1.6;
        case "Inquisitor": return 1.6;
        case "Death Knight": return 1.6;
        case "Cleric": return 1.2;
        case "Shaman": return 1.2;
        case "Ranger": return 1.2;
        case "Bladesinger": return 1.2;
        default: return 1.0;
    }
}

function applyCondition(platoon, condition) {
    if (condition === "Stunned" && platoon.conditions.some(c => c.type === "Stunned")) return;
    platoon.conditions.push({ type: condition, duration: condition === "Stunned" ? 1 : 2 });
}

function processConditions(platoon) {
    let conditionDamage = 0;
    platoon.conditions = platoon.conditions.filter(cond => cond.duration > 0);
    for (let cond of platoon.conditions) {
        if (cond.type === "Bleeding") {
            conditionDamage += rollDice(6) * 100;
        } else if (cond.type === "Burning") {
            conditionDamage += rollDice(8) * 100;
        } else if (cond.type === "Wounded") {
            platoon.damagePerTroop *= 0.8;
        } else if (cond.type === "Stunned") {
            return { damage: conditionDamage, stunned: true };
        }
        cond.duration -= 1;
    }
    return { damage: conditionDamage, stunned: false };
}

function applySpellEffect(spell, target) {
    if (spell.effect?.includes("Burning") && rollDice(100) <= 20) {
        applyCondition(target, "Burning");
    } else if (spell.effect?.includes("Wounded") && rollDice(100) <= 20) {
        applyCondition(target, "Wounded");
    } else if (spell.effect?.includes("Stunned") && rollDice(100) <= 5) {
        applyCondition(target, "Stunned");
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function debouncedUpdateUserAssets() {
    const userAssetGrid = document.getElementById('user-asset-grid');
    const errorElement = document.getElementById('address-error-battle');
    if (!userAssetGrid || !errorElement) {
        errorElement.textContent = 'Battle UI elements missing.';
        return;
    }
    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        userAssetGrid.innerHTML = '<p>Load a wallet to view your assets.</p>';
        errorElement.textContent = 'No wallet loaded.';
        userAssets = [];
        checkBattleStartConditions();
        return;
    }
    userAssetGrid.innerHTML = '<p>Loading your assets...</p>';
    try {
        await ensureConnectedWithRetry();
        const { totalBalanceXrp, totalReserveXrp, availableBalanceXrp } = await calculateAvailableBalance(globalAddress);
        const accountLinesResponse = await client.request({
            command: "account_lines",
            account: globalAddress,
            ledger_index: "current"
        });
        let assets = [{
            name: "XRP",
            balance: `Total: ${formatBalance(totalBalanceXrp)} XRP<br>Reserve: ${formatBalance(totalReserveXrp)} XRP<br>Available: ${formatBalance(availableBalanceXrp)} XRP`,
            selected: false,
            hex: "XRP",
            issuer: "",
            isLPToken: false
        }];
        if (accountLinesResponse?.result?.lines) {
            for (const line of accountLinesResponse.result.lines) {
                const currencyHex = line.currency;
                const issuer = line.account;
                const balance = parseFloat(line.balance);
                if (balance > 0) {
                    let assetName;
                    if (currencyHex.length === 40 && /^[0-9A-Fa-f]{40}$/.test(currencyHex)) {
                        assetName = xrpl.convertHexToString(currencyHex).replace(/\0/g, '');
                        if (!assetName || assetName.includes('\0') || assetName.match(/[^a-zA-Z0-9]/)) {
                            assetName = `[HEX:${currencyHex.slice(0, 8)}]`;
                        }
                    } else if (currencyHex.length === 3 && /^[A-Z0-9]{3}$/.test(currencyHex)) {
                        assetName = currencyHex;
                    } else {
                        assetName = `[HEX:${currencyHex.slice(0, 8)}]`;
                    }
                    const lpName = await decodeLPToken(currencyHex, issuer);
                    const isLPToken = !!lpName;
                    if (lpName) assetName = lpName;
                    assets.push({
                        name: assetName,
                        balance: formatBalance(balance),
                        issuer: issuer,
                        selected: false,
                        hex: currencyHex,
                        isLPToken
                    });
                }
            }
        }
        if (dynamicAssets?.length > 0) {
            for (const asset of dynamicAssets) {
                const accountLines = cachedAccountLines?.result?.lines || [];
                const line = accountLines.find(l => l.currency === asset.hex && l.account === asset.issuer);
                if (line && parseFloat(line.balance) > 0) {
                    let assetName = xrpl.convertHexToString(asset.hex).replace(/\0/g, '');
                    if (!assetName || assetName.includes('\0') || assetName.match(/[^a-zA-Z0-9]/)) {
                        assetName = `[HEX:${asset.hex.slice(0, 8)}]`;
                    }
                    const lpName = await decodeLPToken(asset.hex, asset.issuer);
                    const isLPToken = !!lpName;
                    if (lpName) assetName = lpName;
                    if (!assets.some(a => a.name === assetName && a.issuer === asset.issuer)) {
                        assets.push({
                            name: assetName,
                            balance: formatBalance(line.balance),
                            issuer: asset.issuer,
                            selected: false,
                            hex: asset.hex,
                            isLPToken
                        });
                    }
                }
            }
        }
        const validAssets = (await Promise.all(assets.map(async asset => {
            const stats = await calculateUnitStats(asset);
            return stats ? { ...asset, troops: stats.troops, power: stats.power } : null;
        }))).filter(asset => asset !== null);
        userAssetGrid.innerHTML = validAssets.length > 0 ? await Promise.all(validAssets.map(async (asset, index) => {
            const stats = await calculateUnitStats(asset);
            const army = await generateArmy(asset);
            const abilityInfo = army ? army.platoons.map(p => {
                const ability = BattleConfig.specialAbilities.find(a => a.class === p.class);
                return ability ? `${pluralizeClass(p.class)}: ${ability.name} (5% chance: ${ability.description})` : '';
            }).filter(Boolean).join('<br>') : '';
            const ticker = asset.name === 'XRP' ? 'XRP' : (asset.name.startsWith('$') ? asset.name : `$${asset.name}`);
            const iconSrc = asset.name === 'XRP' ? './icons/XRP.png' : `./icons/${ticker}-${asset.issuer || 'unknown'}.png`;
            return `
                <div class="battle-asset-item">
                    <div class="token-row">
                        <input type="checkbox" id="user-asset-${index}" onchange="toggleAssetSelection('user', ${index})">
                        <label for="user-asset-${index}" title="${abilityInfo || 'No abilities'}">
                            <img src="${iconSrc}" alt="${asset.name}" class="asset-icon" onerror="console.log('Icon failed to load: ${iconSrc}'); this.src='./icons/XRP.png';">
                            ${asset.name} - ${stats.troops.toLocaleString()} troops, Power: ${stats.power.toLocaleString()}${asset.issuer ? ` (Issuer: <a href="https://xrpscan.com/account/${asset.issuer}" class="address-link" target="_blank">${asset.issuer.slice(0, 10)}...</a>)` : ''}
                        </label>
                    </div>
                    <div class="asset-balance">${asset.balance}</div>
                </div>
            `;
        })).then(htmlArray => htmlArray.join('') || '<p>No valid assets found for this wallet.</p>') : '<p>No valid assets found for this wallet.</p>';
        userAssets = validAssets;
        errorElement.textContent = '';
        checkBattleStartConditions();
    } catch (error) {
        errorElement.textContent = `Error loading assets: ${error.message}`;
        userAssetGrid.innerHTML = '<p>Failed to load your assets.</p>';
        userAssets = [];
        checkBattleStartConditions();
    }
}

async function debouncedCheckOpponentBalance() {
    const opponentAddressInput = document.getElementById('opponent-address');
    const opponentAssetGrid = document.getElementById('opponent-asset-grid');
    const errorElement = document.getElementById('address-error-battle');
    if (!opponentAddressInput || !opponentAssetGrid || !errorElement) {
        errorElement.textContent = 'Battle UI elements missing.';
        return;
    }
    const opponentAddress = opponentAddressInput.value.trim();
    if (!xrpl.isValidAddress(opponentAddress)) {
        errorElement.textContent = 'Invalid opponent address.';
        opponentAssetGrid.innerHTML = '<p>Enter a valid opponent address.</p>';
        checkBattleStartConditions();
        return;
    }
    errorElement.textContent = '';
    opponentAssetGrid.innerHTML = '<p>Loading opponent assets...</p>';
    try {
        await ensureConnectedWithRetry();
        const { totalBalanceXrp, totalReserveXrp, availableBalanceXrp } = await calculateAvailableBalance(opponentAddress);
        const accountLinesResponse = await client.request({
            command: "account_lines",
            account: opponentAddress,
            ledger_index: "current"
        });
        let assets = [{
            name: "XRP",
            balance: `Total: ${formatBalance(totalBalanceXrp)} XRP<br>Reserve: ${formatBalance(totalReserveXrp)} XRP<br>Available: ${formatBalance(availableBalanceXrp)} XRP`,
            selected: false,
            hex: "XRP",
            issuer: "",
            isLPToken: false
        }];
        if (accountLinesResponse?.result?.lines) {
            for (const line of accountLinesResponse.result.lines) {
                const currencyHex = line.currency;
                const issuer = line.account;
                const balance = parseFloat(line.balance);
                if (balance > 0) {
                    let assetName;
                    if (currencyHex.length === 40 && /^[0-9A-Fa-f]{40}$/.test(currencyHex)) {
                        assetName = xrpl.convertHexToString(currencyHex).replace(/\0/g, '');
                        if (!assetName || assetName.includes('\0') || assetName.match(/[^a-zA-Z0-9]/)) {
                            assetName = `[HEX:${currencyHex.slice(0, 8)}]`;
                        }
                    } else if (currencyHex.length === 3 && /^[A-Z0-9]{3}$/.test(currencyHex)) {
                        assetName = currencyHex;
                    } else {
                        assetName = `[HEX:${currencyHex.slice(0, 8)}]`;
                    }
                    const lpName = await decodeLPToken(currencyHex, issuer);
                    const isLPToken = !!lpName;
                    if (lpName) assetName = lpName;
                    assets.push({
                        name: assetName,
                        balance: formatBalance(balance),
                        issuer: issuer,
                        selected: false,
                        hex: currencyHex,
                        isLPToken
                    });
                }
            }
        }
        const validAssets = (await Promise.all(assets.map(async asset => {
            const stats = await calculateUnitStats(asset);
            return stats ? { ...asset, troops: stats.troops, power: stats.power } : null;
        }))).filter(asset => asset !== null);
        opponentAssetGrid.innerHTML = validAssets.length > 0 ? await Promise.all(validAssets.map(async (asset, index) => {
            const stats = await calculateUnitStats(asset);
            const army = await generateArmy(asset);
            const abilityInfo = army ? army.platoons.map(p => {
                const ability = BattleConfig.specialAbilities.find(a => a.class === p.class);
                return ability ? `${pluralizeClass(p.class)}: ${ability.name} (5% chance: ${ability.description})` : '';
            }).filter(Boolean).join('<br>') : '';
            const ticker = asset.name === 'XRP' ? 'XRP' : (asset.name.startsWith('$') ? asset.name : `$${asset.name}`);
            const iconSrc = asset.name === 'XRP' ? './icons/XRP.png' : `./icons/${ticker}-${asset.issuer || 'unknown'}.png`;
            return `
                <div class="battle-asset-item">
                    <div class="token-row">
                        <input type="checkbox" id="opponent-asset-${index}" onchange="toggleAssetSelection('opponent', ${index})">
                        <label for="opponent-asset-${index}" title="${abilityInfo || 'No abilities'}">
                            <img src="${iconSrc}" alt="${asset.name}" class="asset-icon" onerror="console.log('Icon failed to load: ${iconSrc}'); this.src='./icons/XRP.png';">
                            ${asset.name} - ${stats.troops.toLocaleString()} troops, Power: ${stats.power.toLocaleString()}${asset.issuer ? ` (Issuer: <a href="https://xrpscan.com/account/${asset.issuer}" class="address-link" target="_blank">${asset.issuer.slice(0, 10)}...</a>)` : ''}
                        </label>
                    </div>
                    <div class="asset-balance">${asset.balance}</div>
                </div>
            `;
        })).then(htmlArray => htmlArray.join('') || '<p>No valid assets found for this address.</p>') : '<p>No valid assets found for this address.</p>';
        opponentAssets = validAssets;
        errorElement.textContent = '';
        checkBattleStartConditions();
    } catch (error) {
        errorElement.textContent = `Error loading opponent assets: ${error.message}`;
        opponentAssetGrid.innerHTML = '<p>Failed to load opponent assets. Address may not exist or have no assets.</p>';
        opponentAssets = [];
        checkBattleStartConditions();
    }
}

function populateBattlefields() {
    const battlefieldOptions = document.getElementById('battlefield-options');
    const battlefieldDisplay = document.getElementById('battlefield-display');
    const battlefieldDetails = document.getElementById('battlefield-details-text');
    if (!battlefieldOptions || !battlefieldDisplay || !battlefieldDetails) return;
    battlefieldOptions.innerHTML = BattleConfig.battlefields.map((bf, index) => `
        <div class="battlefield-option" data-description="${bf.description}" data-index="${index}">
            ${bf.name}
        </div>
    `).join('');
    const options = battlefieldOptions.querySelectorAll('.battlefield-option');
    options.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            const index = parseInt(option.getAttribute('data-index'));
            selectBattlefield(index, event);
        });
    });
    battlefieldDisplay.textContent = 'Select Battlefield';
    battlefieldDisplay.setAttribute('data-value', '');
    battlefieldDetails.textContent = 'Select a battlefield to see its details.';
    selectedBattlefield = null;
    const userPowerBar = document.getElementById('user-power-bar');
    const enemyPowerBar = document.getElementById('enemy-power-bar');
    const userPowerDisplay = document.getElementById('user-army-power');
    const enemyPowerDisplay = document.getElementById('enemy-army-power');
    if (userPowerBar && enemyPowerBar && userPowerDisplay && enemyPowerDisplay) {
        userPowerBar.value = 0;
        enemyPowerBar.value = 0;
        userPowerDisplay.textContent = 'Your Army Power: 0';
        enemyPowerDisplay.textContent = 'Enemy Army Power: 0';
    }
    checkBattleStartConditions();
}

function toggleBattlefieldDropdown(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById('battlefield-panel');
    const dropdownTrigger = document.querySelector('#battlefield-selector .dropdown-trigger');
    if (!panel || !dropdownTrigger) return;
    const isVisible = panel.style.display === 'block';
    panel.style.display = isVisible ? 'none' : 'block';
    dropdownTrigger.classList.toggle('active', !isVisible);
}

function selectBattlefield(index, event) {
    if (event) event.stopPropagation();
    const battlefieldDisplay = document.getElementById('battlefield-display');
    const battlefieldPanel = document.getElementById('battlefield-panel');
    const battlefieldDetails = document.getElementById('battlefield-details-text');
    if (!battlefieldDisplay || !battlefieldPanel || !battlefieldDetails) return;
    selectedBattlefield = BattleConfig.battlefields[index];
    battlefieldDisplay.textContent = selectedBattlefield.name;
    battlefieldDisplay.setAttribute('data-value', selectedBattlefield.name);
    battlefieldPanel.style.display = 'none';
    const terrainEffect = selectedBattlefield.terrainEffect || "No special terrain effects";
    const imageSrc = `./icons/${index}.jpg`;
    
    battlefieldDetails.innerHTML = `
        <div class="battlefield-details-content">
            <img src="${imageSrc}" alt="${selectedBattlefield.name}" class="battlefield-image" onerror="console.log('Battlefield image failed to load: ${imageSrc}'); this.style.display='none';">
            <div class="battlefield-text">
                ${selectedBattlefield.description}<br>
                <span style="color: #ffaa00;">Environmental Risk: ${selectedBattlefield.risk}%</span><br>
                <span style="color: #ff4444;">Terrain Effect: ${terrainEffect}</span>
            </div>
        </div>
    `;
    battlefieldDetails.style.display = 'none';
    battlefieldDetails.offsetHeight;
    battlefieldDetails.style.display = 'block';
    checkBattleStartConditions();
}
function checkBattleStartConditions() {
    const startButton = document.getElementById('battle-start-btn');
    const battlefieldDisplay = document.getElementById('battlefield-display');
    if (!startButton || !battlefieldDisplay) return;
    const userSelected = userAssets.some(a => a.selected);
    const opponentSelected = opponentAssets.some(a => a.selected);
    const battlefieldSelected = selectedBattlefield && selectedBattlefield.name && battlefieldDisplay.getAttribute('data-value') !== '';
    startButton.disabled = !(userSelected && opponentSelected && battlefieldSelected);
}

async function toggleAssetSelection(side, index) {
    const assets = side === 'user' ? userAssets : opponentAssets;
    if (assets[index]) {
        assets[index].selected = !assets[index].selected;
    }
    const selectedAssets = assets.filter(a => a.selected);
    const smallAssets = selectedAssets.filter(a => a.troops < 5 && a.troops > 0);
    const largeAssets = selectedAssets.filter(a => a.troops >= 5);
    const mixedTroops = smallAssets.reduce((sum, a) => sum + a.troops, 0);
    let armies = await Promise.all(largeAssets.map(generateArmy));
    armies = armies.filter(a => a !== null);
    if (mixedTroops > 0) {
        const mixedAsset = {
            name: "Mixed",
            troops: mixedTroops,
            power: mixedTroops * 10,
            balance: smallAssets.map(a => a.balance).join(", "),
            hex: "MIXED",
            issuer: "",
            selected: true
        };
        const mixedArmy = await generateArmy(mixedAsset);
        if (mixedArmy) armies.push(mixedArmy);
    }
    const totalPower = calculateArmyPower(armies);
    const powerBar = side === 'user' ? document.getElementById('user-power-bar') : document.getElementById('enemy-power-bar');
    const powerDisplay = side === 'user' ? document.getElementById('user-army-power') : document.getElementById('enemy-army-power');
    const assetGrid = side === 'user' ? document.getElementById('user-asset-grid') : document.getElementById('opponent-asset-grid');
    if (powerBar && powerDisplay && assetGrid) {
        if (armies.length > 0) {
            powerBar.value = 100;
            powerDisplay.textContent = `${side === 'user' ? 'Your' : 'Enemy'} Army Power: ${totalPower.toLocaleString()}`;
            if (side === 'user') window.initialUserPower = totalPower;
            else window.initialOpponentPower = totalPower;
            assetGrid.innerHTML = await Promise.all(assets.map(async (asset, idx) => {
                const stats = await calculateUnitStats(asset);
                const fallbackWarning = stats.isFallback ? '<span style="color: #ffaa00;"> (Fallback price used)</span>' : '';
                const army = await generateArmy(asset);
                const abilityInfo = army ? army.platoons.map(p => {
                    const ability = BattleConfig.specialAbilities.find(a => a.class === p.class);
                    return ability ? `${pluralizeClass(p.class)}: ${ability.name} (5% chance: ${ability.description})` : '';
                }).filter(Boolean).join('<br>') : '';
                
                const ticker = asset.name === 'XRP' ? 'XRP' : (asset.name.startsWith('$') ? asset.name : `$${asset.name}`);
                const iconSrc = asset.name === 'XRP' ? './icons/XRP.png' : `./icons/${ticker}-${asset.issuer || 'unknown'}.png`;
                
                return `
                    <div class="battle-asset-item">
                        <div class="token-row">
                            <input type="checkbox" id="${side}-asset-${idx}" onchange="toggleAssetSelection('${side}', ${idx})" ${asset.selected ? 'checked' : ''}>
                            <label for="${side}-asset-${idx}" title="${abilityInfo || 'No abilities'}">
                                <img src="${iconSrc}" alt="${asset.name}" class="asset-icon" onerror="console.log('Icon failed to load: ${iconSrc}'); this.src='./icons/XRP.png';">
                                ${asset.name} - ${stats.troops.toLocaleString()} troops, Power: ${stats.power.toLocaleString()}${fallbackWarning}${asset.issuer ? ` (Issuer: <a href="https://xrpscan.com/account/${asset.issuer}" class="address-link" target="_blank">${asset.issuer.slice(0, 10)}...</a>)` : ''}
                            </label>
                        </div>
                        <div class="asset-balance">${asset.balance}</div>
                    </div>
                `;
            })).then(htmlArray => {
                const html = htmlArray.join('') || '<p>No valid assets found for this address.</p>';
               
                return html;
            });
            
            assetGrid.style.display = 'none';
            assetGrid.offsetHeight; 
            assetGrid.style.display = 'block';
        } else {
            powerBar.value = 0;
            powerDisplay.textContent = `${side === 'user' ? 'Your' : 'Enemy'} Army Power: 0`;
            if (side === 'user') window.initialUserPower = 0;
            else window.initialOpponentPower = 0;
            assetGrid.innerHTML = '<p>No assets found or selected.</p>';
        }
    }
    
    checkBattleStartConditions();
}

function selectRandomTarget(armies) {
    const aliveArmies = armies.filter(a => a.platoons.some(p => p.troopsAlive > 0));
    if (!aliveArmies.length) return null;
    const army = aliveArmies[Math.floor(Math.random() * aliveArmies.length)];
    const alivePlatoons = army.platoons.filter(p => p.troopsAlive > 0);
    if (!alivePlatoons.length) return null;
    const platoon = alivePlatoons[Math.floor(Math.random() * alivePlatoons.length)];
    
    return { platoon, asset: army.asset };
}

function calculateSpellDamage(spell, platoon, isAncientOrForsaken = false) {
    const multiplier = isAncientOrForsaken ? 4000 : 400;
    let rolls = [];
    let total = 0;
    if (spell.damage === "3d4") {
        rolls = [rollDice(4), rollDice(4), rollDice(4)];
        total = rolls.reduce((sum, r) => sum + r, 0) * multiplier;
    } else if (spell.damage === "3d6") {
        rolls = [rollDice(6), rollDice(6), rollDice(6)];
        total = rolls.reduce((sum, r) => sum + r, 0) * multiplier;
    } else if (spell.damage === "d4") {
        rolls = [rollDice(4)];
        total = rolls[0] * multiplier;
    } else if (spell.damage === "d6") {
        rolls = [rollDice(6)];
        total = rolls[0] * multiplier;
    } else if (spell.damage === "d8") {
        rolls = [rollDice(8)];
        total = rolls[0] * multiplier;
    } else if (spell.damage === "d6 * units" || spell.damage === "d8 * units") {
        rolls = [rollDice(spell.damage === "d6 * units" ? 6 : 8)];
        total = rolls[0] * platoon.troopsAlive * (isAncientOrForsaken ? 500 : 50);
    }
    return Math.max(total, 400);
}

async function applyAttack(platoon, target, assetName, isUser, targetArmies) {
    if (!target || platoon.troopsAlive <= 0) {
        return {
            message: `${isUser ? 'Your' : 'Enemy'} [${assetName} ${pluralizeClass(platoon.class)}] have no troops left to attack!`,
            damage: 0,
            troopsKilled: 0 
        };
    }
    if (target.platoon.troopsAlive <= 0) {
        return {
            message: `${isUser ? 'Your' : 'Enemy'} [${assetName} ${pluralizeClass(platoon.class)}] target a defeated platoon!`,
            damage: 0,
            troopsKilled: 0 
        };
    }

    const conditionResult = processConditions(platoon);
    if (conditionResult.stunned) {
        return {
            message: `${isUser ? 'Your' : 'Enemy'} [${assetName} ${pluralizeClass(platoon.class)}] are stunned and cannot act!`,
            damage: 0,
            troopsKilled: 0 
        };
    }

    let conditionDamage = conditionResult.damage;
    if (conditionDamage > 0) {
        const troopsKilled = Math.floor(conditionDamage / platoon.hpPerTroop);
        platoon.troopsAlive = Math.max(0, platoon.troopsAlive - troopsKilled);
        if (platoon.troopsAlive <= 0) {
            return {
                message: `${isUser ? 'Your' : 'Enemy'} [${assetName} ${pluralizeClass(platoon.class)}] succumb to conditions, losing ${troopsKilled.toLocaleString()} troops!`,
                damage: 0,
                troopsKilled: 0 
            };
        }
    }

    let damage = 0;
    let attackType = "";
    let isLegendary = false;
    let isEpic = false;
    let isAncientOrForsaken = false;
    let isSpecial = false;
    let specialMessage = "";
    let additionalTargets = [];
    let totalTroopsKilled = 0; 
    const rollForSpecial = rollDice(100);
    let damagePerTroop = platoon.damagePerTroop;
    let weaponBonus = 0;
    let maxKills = platoon.troopsAlive;
    let hitChance = 0.75;
    if (platoon.class === "Archer") hitChance += 0.1;
    if (selectedBattlefield.terrainEffect.includes("poison")) hitChance -= 0.15;
    const ability = BattleConfig.specialAbilities.find(a => a.class === platoon.class);

    if (ability && rollDice(100) / 100 <= ability.chance) {
        isSpecial = true;
        if (ability.effect === "boostDamage") {
            damagePerTroop *= ability.value;
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description})</span>`;
        } else if (ability.effect === "multiTarget") {
            for (let i = 0; i < ability.value; i++) {
                const extraTarget = selectRandomTarget(targetArmies);
                if (extraTarget && extraTarget !== target) additionalTargets.push(extraTarget);
            }
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description})</span>`;
        } else if (ability.effect === "boostDamageRecoil") {
            damagePerTroop *= ability.value;
            const recoilLoss = Math.floor(platoon.troopsAlive * 0.05);
            platoon.troopsAlive = Math.max(0, platoon.troopsAlive - recoilLoss);
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description} Loses ${recoilLoss} troops.)</span>`;
        } else if (ability.effect === "boostSpell") {
            damagePerTroop *= ability.value;
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description})</span>`;
        } else if (ability.effect === "heal") {
            const healedTroops = Math.floor(platoon.initialTroops * ability.value);
            platoon.troopsAlive = Math.min(platoon.initialTroops, platoon.troopsAlive + healedTroops);
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description} Heals ${healedTroops} troops.)</span>`;
        } else if (ability.effect === "reduceDamage") {
            platoon.damageReduction = ability.value;
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description})</span>`;
        } else if (ability.effect === "applyCondition") {
            applyCondition(target.platoon, ability.value);
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description})</span>`;
        } else if (ability.effect === "boostSpellStun") {
            damagePerTroop *= ability.value;
            if (rollDice(100) <= 10) applyCondition(target.platoon, "Stunned");
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description}${rollDice(100) <= 10 ? " Stuns target!" : ""})</span>`;
        } else if (ability.effect === "boostAccuracyDamage") {
            hitChance += ability.value.hit;
            damagePerTroop *= ability.value.damage;
            specialMessage = ` <span class="special-ability">${ability.name}</span> <span class="special-effect">(${ability.description})</span>`;
        }
    }

    if (platoon.damageReduction) {
        damagePerTroop *= (1 - platoon.damageReduction);
        platoon.damageReduction = 0;
    }

    if (["Wizard", "Sorcerer", "Cleric", "Druid"].includes(platoon.class)) {
        if (!isSpecial && rollForSpecial <= 20 && platoon.troopsAlive >= 20 && (platoon.ancientSpells.length > 0 || platoon.forsakenRuneSpells.length > 0)) {
            const spellList = platoon.ancientSpells.length > 0 ? platoon.ancientSpells : platoon.forsakenRuneSpells;
            const spell = spellList[Math.floor(Math.random() * spellList.length)];
            attackType = spell.name;
            isAncientOrForsaken = true;
            damagePerTroop *= platoon.troopsAlive >= 50 ? 1.5 : 1.2;
            applySpellEffect(spell, target.platoon);
        } else {
            const spell = platoon.spells[Math.floor(Math.random() * platoon.spells.length)];
            attackType = spell.name;
            damagePerTroop *= platoon.troopsAlive >= 50 ? 1.2 : 1.1;
            applySpellEffect(spell, target.platoon);
        }
    } else {
        let selectedWeapon = platoon.weapon;
        if (!isSpecial && rollForSpecial <= 20 && platoon.troopsAlive >= 20 && platoon.legendaryWeapons.length > 0) {
            selectedWeapon = platoon.legendaryWeapons[Math.floor(Math.random() * platoon.legendaryWeapons.length)];
            attackType = selectedWeapon.name;
            isLegendary = true;
            weaponBonus = selectedWeapon.damageBonus * 0.03;
        } else if (!isSpecial && rollForSpecial <= 30 && platoon.troopsAlive >= 20 && platoon.epicWeapons.length > 0) {
            selectedWeapon = platoon.epicWeapons[Math.floor(Math.random() * platoon.epicWeapons.length)];
            attackType = selectedWeapon.name;
            isEpic = true;
            weaponBonus = selectedWeapon.damageBonus * 0.02;
        } else {
            attackType = selectedWeapon.name;
            weaponBonus = selectedWeapon.damageBonus * 0.005;
        }
        damagePerTroop += weaponBonus;
    }

    const hits = Math.floor(platoon.troopsAlive * (rollDice(100) / 100 < hitChance ? 1 : 0.5));
    damage = hits * damagePerTroop;
    let troopsKilled = Math.min(maxKills, Math.min(target.platoon.troopsAlive, Math.floor(damage / target.platoon.hpPerTroop)));
    if (damage >= target.platoon.hpPerTroop * 0.5 && troopsKilled === 0 && target.platoon.troopsAlive > 0) {
        troopsKilled = 1;
        target.platoon.troopsAlive--;
    } else {
        target.platoon.troopsAlive = Math.max(0, target.platoon.troopsAlive - troopsKilled);
    }
    totalTroopsKilled += troopsKilled;

    let message = `${isUser ? 'Your' : 'Enemy'} [${assetName} ${pluralizeClass(platoon.class)}] attack ${!isUser ? 'Your' : 'Enemy'} [${target.asset} ${pluralizeClass(target.platoon.class)}] with ${attackType}`;
    if (isLegendary) message += " [Legendary Weapon]";
    else if (isEpic) message += " [Epic Weapon]";
    else if (isAncientOrForsaken) message += " [Legendary Spell]";
    if (isSpecial) message += specialMessage;
    message += `. Damage: ${damage.toLocaleString()}, Troops Killed: ${troopsKilled.toLocaleString()}`;

    let additionalMessages = [];
    if (isSpecial && ability.effect === "multiTarget") {
        for (let extraTarget of additionalTargets) {
            if (extraTarget.platoon.troopsAlive > 0) {
                const extraDamage = hits * damagePerTroop * 0.5;
                const extraTroopsKilled = Math.min(maxKills, Math.min(extraTarget.platoon.troopsAlive, Math.floor(extraDamage / extraTarget.platoon.hpPerTroop)));
                extraTarget.platoon.troopsAlive = Math.max(0, extraTarget.platoon.troopsAlive - extraTroopsKilled);
                additionalMessages.push(
                    `${isUser ? 'Your' : 'Enemy'} [${assetName} ${pluralizeClass(platoon.class)}]'s <span class="special-ability">${ability.name}</span> hits ${!isUser ? 'Your' : 'Enemy'} [${extraTarget.asset} ${pluralizeClass(extraTarget.platoon.class)}]. Damage: ${extraDamage.toLocaleString()}, Troops Killed: ${extraTroopsKilled.toLocaleString()}`
                );
                totalTroopsKilled += extraTroopsKilled;
                damage += extraDamage;
            }
        }
    }

    return { message, additionalMessages, damage, troopsKilled: totalTroopsKilled };
}

function pluralizeClass(className) {
    const plurals = {
        Fighter: "Fighters",
        Archer: "Archers",
        Barbarian: "Barbarians",
        Wizard: "Wizards",
        Cleric: "Clerics",
        Rogue: "Rogues",
        Paladin: "Paladins",
        Druid: "Druids",
        Sorcerer: "Sorcerers",
        Monk: "Monks",
        "Death Knight": "Death Knights",
        Ranger: "Rangers",
        Necromancer: "Necromancers",
        Shaman: "Shamans",
        Assassin: "Assassins",
        Warlock: "Warlocks",
        Berserker: "Berserkers",
        Inquisitor: "Inquisitors",
        Elementalist: "Elementalists",
        Bladesinger: "Bladesingers"
    };
    return plurals[className] || className + "s";
}

function applyEnvironment(armies, userArmies, opponentArmies) {
    const messages = [];
    const damagePercent = rollDice(10) + 5;
    const primaryArmy = armies[Math.floor(Math.random() * armies.length)];
    const primaryIsUser = userArmies.includes(primaryArmy);
    const primaryAlivePlatoons = primaryArmy.platoons.filter(p => p.troopsAlive > 0);
    if (primaryAlivePlatoons.length) {
        const targetPlatoon = primaryAlivePlatoons[Math.floor(Math.random() * primaryAlivePlatoons.length)];
        const damage = Math.max(5, Math.min(20, Math.floor(targetPlatoon.troopsAlive * (damagePercent / 100))));
        targetPlatoon.troopsAlive = Math.max(0, targetPlatoon.troopsAlive - damage);
        
        const effectMessage = selectedBattlefield.effect[Math.floor(Math.random() * selectedBattlefield.effect.length)];
        let message = `<span class="environment-effect">[${selectedBattlefield.name}] ${effectMessage}</span> kills ${damage.toLocaleString()} troops in <span class="${primaryIsUser ? 'user-army' : 'enemy-army'}">${primaryIsUser ? 'Your' : 'Enemy'} [${primaryArmy.asset} ${pluralizeClass(targetPlatoon.class)}]</span>.`;
        
        if (selectedBattlefield.terrainEffect[0].includes("poison") && rollDice(100) <= 20) {
            applyCondition(targetPlatoon, "Wounded");
            const terrainMessage = selectedBattlefield.terrainEffect[Math.floor(Math.random() * selectedBattlefield.terrainEffect.length)];
            message += ` ${terrainMessage.split(" ")[0]} applied!`;
        } else if (selectedBattlefield.terrainEffect[0].includes("ignite") && rollDice(100) <= 20) {
            applyCondition(targetPlatoon, "Burning");
            const terrainMessage = selectedBattlefield.terrainEffect[Math.floor(Math.random() * selectedBattlefield.terrainEffect.length)];
            message += ` ${terrainMessage.split(" ")[0]} applied!`;
        }
        messages.push(message);
    }
    if (rollDice(100) <= 20) {
        const otherArmies = armies.filter(a => a !== primaryArmy);
        if (otherArmies.length) {
            const secondaryArmy = otherArmies[Math.floor(Math.random() * otherArmies.length)];
            const secondaryIsUser = userArmies.includes(secondaryArmy);
            const secondaryAlivePlatoons = secondaryArmy.platoons.filter(p => p.troopsAlive > 0);
            if (secondaryAlivePlatoons.length) {
                const targetPlatoon = secondaryAlivePlatoons[Math.floor(Math.random() * secondaryAlivePlatoons.length)];
                const damage = Math.max(5, Math.min(20, Math.floor(targetPlatoon.troopsAlive * (damagePercent / 100))));
                targetPlatoon.troopsAlive = Math.max(0, targetPlatoon.troopsAlive - damage);
                
                const effectMessage = selectedBattlefield.effect[Math.floor(Math.random() * selectedBattlefield.effect.length)];
                let message = `<span class="environment-effect">[${selectedBattlefield.name}] ${effectMessage}</span> kills ${damage.toLocaleString()} troops in <span class="${secondaryIsUser ? 'user-army' : 'enemy-army'}">${secondaryIsUser ? 'Your' : 'Enemy'} [${secondaryArmy.asset} ${pluralizeClass(targetPlatoon.class)}]</span>.`;
                if (selectedBattlefield.terrainEffect[0].includes("poison") && rollDice(100) <= 20) {
                    applyCondition(targetPlatoon, "Wounded");
                    const terrainMessage = selectedBattlefield.terrainEffect[Math.floor(Math.random() * selectedBattlefield.terrainEffect.length)];
                    message += ` ${terrainMessage.split(" ")[0]} applied!`;
                } else if (selectedBattlefield.terrainEffect[0].includes("ignite") && rollDice(100) <= 20) {
                    applyCondition(targetPlatoon, "Burning");
                    const terrainMessage = selectedBattlefield.terrainEffect[Math.floor(Math.random() * selectedBattlefield.terrainEffect.length)];
                    message += ` ${terrainMessage.split(" ")[0]} applied!`;
                }
                messages.push(message);
            }
        }
    }
    return { message: messages.join("<br>") };
}

function calculateArmyPower(armies) {
    const totalPower = armies.reduce((total, army) => {
        const alivePower = army.platoons.reduce((sum, platoon) => {
            const power = Math.max(0, platoon.troopsAlive) * 10;
            
            return sum + power;
        }, 0);
        army.currentPower = alivePower;
        
        return total + alivePower;
    }, 0);
    
    return totalPower;
}

function declareWinner(userArmies, opponentArmies, battleLog) {
    const userTroops = userArmies.reduce((sum, a) => sum + a.platoons.reduce((pSum, p) => pSum + p.troopsAlive, 0), 0);
    const opponentTroops = opponentArmies.reduce((sum, a) => sum + a.platoons.reduce((pSum, p) => pSum + p.troopsAlive, 0), 0);
    let outcomeMessage;
    let outcomeForMemo;

    if (userTroops === 0 && opponentTroops === 0) {
        outcomeMessage = `Battle in ${selectedBattlefield.name} ends in a draw! Both armies are annihilated.`;
        outcomeForMemo = 'draw';
    } else if (userTroops === 0) {
        outcomeMessage = `Opponent wins in ${selectedBattlefield.name}!`;
        outcomeForMemo = 'victory';
    } else if (opponentTroops === 0) {
        outcomeMessage = `Your army wins in ${selectedBattlefield.name}!`;
        outcomeForMemo = 'loss';
    } else {
        const winner = userTroops > opponentTroops ? 'Your army' : 'Opponent';
        outcomeMessage = `${winner} wins in ${selectedBattlefield.name} with ${Math.max(userTroops, opponentTroops).toLocaleString()} troops remaining!`;
        outcomeForMemo = userTroops > opponentTroops ? 'loss' : 'victory';
    }

    battleLog.innerHTML += `<p class="environment">${outcomeMessage}</p>`;
    
    
    battleResultData.outcome = outcomeForMemo;
    battleResultData.battleCompleted = true;
}

async function startBattleSimulation() {
    const battleLog = document.getElementById('battle-log-output');
    const startButton = document.getElementById('battle-start-btn');
    const progressBar = document.getElementById('battle-progress');
    const errorElement = document.getElementById('address-error-battle');
    if (!battleLog || !startButton || !progressBar || !errorElement) {
        errorElement.textContent = 'Battle UI elements missing.';
        return;
    }
    if (!selectedBattlefield) {
        battleLog.innerHTML = '<p class="environment">Please select a battlefield.</p>';
        errorElement.textContent = 'No battlefield selected.';
        return;
    }
    const userSelectedAssets = userAssets.filter(a => a.selected);
    const opponentSelectedAssets = opponentAssets.filter(a => a.selected);
    if (userSelectedAssets.length === 0 || opponentSelectedAssets.length === 0) {
        battleLog.innerHTML = '<p class="environment">Select assets for both sides.</p>';
        errorElement.textContent = 'Select at least one asset per side.';
        return;
    }
    const userArmies = (await Promise.all(userSelectedAssets.map(generateArmy))).filter(a => a !== null);
    const opponentArmies = (await Promise.all(opponentSelectedAssets.map(generateArmy))).filter(a => a !== null);
    if (userArmies.length === 0 || opponentArmies.length === 0) {
        battleLog.innerHTML = '<p class="environment">No valid armies generated. Some assets may lack price data.</p>';
        errorElement.textContent = 'No valid armies available. Check if selected assets have valid price data.';
        return;
    }
    let round = 1;
    const initialUserPower = calculateArmyPower(userArmies);
    const initialOpponentPower = calculateArmyPower(opponentArmies);
    window.initialUserPower = initialUserPower || 1;
    window.initialOpponentPower = initialOpponentPower || 1;

    resetBattleResultTransaction();
    battleResultData.userAssets = userSelectedAssets.map(a => a.name);
    battleResultData.userPower = initialUserPower;
    battleResultData.opponentAssets = opponentSelectedAssets.map(a => a.name);
    battleResultData.opponentPower = initialOpponentPower;
    battleResultData.opponentAddress = document.getElementById('opponent-address').value.trim();

    battleLog.innerHTML = `
        <p class="environment">Battle begins in ${selectedBattlefield.name}!</p>
        <div class="army-power-display">
            <span>Your Initial Army Power: ${initialUserPower.toLocaleString()}</span>
            <span>Enemy Initial Army Power: ${initialOpponentPower.toLocaleString()}</span>
        </div>
    `;
    const userProgressBar = document.getElementById('user-power-bar');
    const opponentProgressBar = document.getElementById('enemy-power-bar');
    if (userProgressBar && opponentProgressBar) {
        userProgressBar.value = 100;
        opponentProgressBar.value = 100;
    }
    startButton.disabled = true;
    progressBar.value = 0;
    if (window.battleIntervalId) clearInterval(window.battleIntervalId);
    window.battleIntervalId = setInterval(async () => {
        try {
            await runRound(userArmies, opponentArmies, round, battleLog);
            const userAlive = userArmies.some(a => a.platoons.some(p => p.troopsAlive > 0));
            const opponentAlive = opponentArmies.some(a => a.platoons.some(p => p.troopsAlive > 0));
            if (!userAlive || !opponentAlive) {
                clearInterval(window.battleIntervalId);
                window.battleIntervalId = null;
                declareWinner(userArmies, opponentArmies, battleLog);
                const finalUserPower = calculateArmyPower(userArmies);
                const finalOpponentPower = calculateArmyPower(opponentArmies);
                battleLog.innerHTML += `<div class="army-power-display"><span>Your Army Power: ${finalUserPower.toLocaleString()}</span><span>Enemy Army Power: ${finalOpponentPower.toLocaleString()}</span></div>`;
                const userPowerPercent = window.initialUserPower > 0 ? (finalUserPower / window.initialUserPower) * 100 : 0;
                const opponentPowerPercent = window.initialOpponentPower > 0 ? (finalOpponentPower / window.initialOpponentPower) * 100 : 0;
                if (userProgressBar && opponentProgressBar) {
                    userProgressBar.value = Math.max(0, Math.min(100, userPowerPercent));
                    opponentProgressBar.value = Math.max(0, Math.min(100, opponentPowerPercent));
                    userProgressBar.style.display = 'none';
                    userProgressBar.offsetHeight;
                    userProgressBar.style.display = 'block';
                    opponentProgressBar.style.display = 'none';
                    opponentProgressBar.offsetHeight;
                    opponentProgressBar.style.display = 'block';
                }
                startButton.disabled = false;
                progressBar.value = 100;
                enableBattleResultTransaction();
            } else {
                const userPowerPercent = window.initialUserPower > 0 ? (calculateArmyPower(userArmies) / window.initialUserPower) * 100 : 0;
                progressBar.value = Math.max(0, Math.min(100, 100 - userPowerPercent));
            }
            round++;
        } catch (error) {
            clearInterval(window.battleIntervalId);
            window.battleIntervalId = null;
            battleLog.innerHTML += `<p class="environment">Battle error: ${error.message}</p>`;
            errorElement.textContent = `Error: ${error.message}`;
            startButton.disabled = false;
        }
    }, 1000);
}

async function runRound(userArmies, opponentArmies, round, battleLog) {
    battleLog.innerHTML += `<h4 style="color: #ff4444;">Round ${round}</h4>`;
    let userPower = calculateArmyPower(userArmies);
    let opponentPower = calculateArmyPower(opponentArmies);
    battleLog.innerHTML += `<div class="army-power-display"><span>Your Army Power: ${userPower.toLocaleString()}</span><span>Enemy Army Power: ${opponentPower.toLocaleString()}</span></div>`;
    
    const forceEffect = round >= 2 && !battleLog.innerHTML.includes("environment");
    if (forceEffect || rollDice(100) <= Math.max(60, selectedBattlefield.risk)) {
        const result = applyEnvironment([...userArmies, ...opponentArmies], userArmies, opponentArmies);
        if (result.message) battleLog.innerHTML += `<p class="environment">${result.message}</p>`;
    }

    const attackMessages = [];
    let userTroopsKilledThisRound = 0;
    let opponentTroopsKilledThisRound = 0;

    const userPlatoons = userArmies.flatMap(army => army.platoons.map(platoon => ({ platoon, army, isUser: true })));
    const opponentPlatoons = opponentArmies.flatMap(army => army.platoons.map(platoon => ({ platoon, army, isUser: false })));
    const allPlatoons = [...userPlatoons, ...opponentPlatoons].filter(p => p.platoon.troopsAlive > 0);

    for (let i = allPlatoons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPlatoons[i], allPlatoons[j]] = [allPlatoons[j], allPlatoons[i]];
    }

    for (const { platoon, army, isUser } of allPlatoons) {
        const targetArmies = isUser ? opponentArmies : userArmies;
        const target = selectRandomTarget(targetArmies);
        if (target) {
            const result = await applyAttack(platoon, target, army.asset, isUser, targetArmies);
            attackMessages.push(`<p class="${isUser ? 'user' : 'opponent'}">${result.message}</p>`);
            if (result.additionalMessages) {
                result.additionalMessages.forEach(msg => {
                    attackMessages.push(`<p class="${isUser ? 'user' : 'opponent'}">${msg}</p>`);
                });
            }
            if (isUser) {
                userTroopsKilledThisRound += result.troopsKilled;
            } else {
                opponentTroopsKilledThisRound += result.troopsKilled;
            }
        }
    }

    
    battleResultData.userTroopsKilled += userTroopsKilledThisRound;
    battleResultData.opponentTroopsKilled += opponentTroopsKilledThisRound;

    attackMessages.forEach(msg => battleLog.innerHTML += msg);

    const finalUserPower = calculateArmyPower(userArmies);
    const finalOpponentPower = calculateArmyPower(opponentArmies);
    const userPowerPercent = window.initialUserPower > 0 ? (finalUserPower / window.initialUserPower) * 100 : 0;
    const opponentPowerPercent = window.initialOpponentPower > 0 ? (finalOpponentPower / window.initialOpponentPower) * 100 : 0;

    const userProgressBar = document.getElementById('user-power-bar');
    const opponentProgressBar = document.getElementById('enemy-power-bar');
    if (userProgressBar && opponentProgressBar) {
        userProgressBar.value = Math.max(0, Math.min(100, userPowerPercent));
        opponentProgressBar.value = Math.max(0, Math.min(100, opponentPowerPercent));
        userProgressBar.style.display = 'none';
        userProgressBar.offsetHeight;
        userProgressBar.style.display = 'block';
        opponentProgressBar.style.display = 'none';
        opponentProgressBar.offsetHeight;
        opponentProgressBar.style.display = 'block';
    }

    const userPowerDisplay = document.getElementById('user-army-power');
    const opponentPowerDisplay = document.getElementById('enemy-army-power');
    if (userPowerDisplay && opponentPowerDisplay) {
        userPowerDisplay.textContent = `Your Army Power: ${finalUserPower.toLocaleString()}`;
        opponentPowerDisplay.textContent = `Enemy Army Power: ${finalOpponentPower.toLocaleString()}`;
    }

    battleLog.scrollTop = battleLog.scrollHeight;
}

function spawnBubbleAnimation(element) {
    const rect = element.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${rect.left + rect.width / 2}px`;
    bubble.style.top = `${rect.top}px`;
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1500);
}

function populateGlossaryCategories() {
    const glossaryOptions = document.getElementById('glossary-options');
    const glossaryDisplay = document.getElementById('glossary-display');
    const glossaryOutput = document.getElementById('glossary-output');
    if (!glossaryOptions || !glossaryDisplay || !glossaryOutput) return;

    const categories = [
        { name: "Classes", description: "View the classes that make up your army." },
        { name: "Weapons", description: "Explore the weapons, including legendary and epic variants." },
        { name: "Spells", description: "Discover the spells, including ancient and forsaken rune variants." },
        { name: "Battlefields", description: "Learn about the battlefields and their effects." },
        { name: "Mechanics", description: "Understand the formulas and mechanics behind the battle." }
    ];

    glossaryOptions.innerHTML = categories.map((category, index) => `
        <div class="glossary-option" data-description="${category.description}" data-index="${index}">
            ${category.name}
        </div>
    `).join('');

    const options = glossaryOptions.querySelectorAll('.glossary-option');
    options.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            const index = parseInt(option.getAttribute('data-index'));
            selectGlossaryCategory(index, event);
        });
    });

    glossaryDisplay.textContent = 'Select Category';
    glossaryDisplay.setAttribute('data-value', '');
    glossaryOutput.innerHTML = '<p>Select a category to view detailed descriptions.</p>';
}


function toggleGlossaryDropdown(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById('glossary-panel');
    const dropdownTrigger = document.querySelector('#glossary-selector .dropdown-trigger');
    if (!panel || !dropdownTrigger) return;
    const isVisible = panel.style.display === 'block';
    panel.style.display = isVisible ? 'none' : 'block';
    dropdownTrigger.classList.toggle('active', !isVisible);
}


function selectGlossaryCategory(index, event) {
    if (event) event.stopPropagation();
    const glossaryDisplay = document.getElementById('glossary-display');
    const glossaryPanel = document.getElementById('glossary-panel');
    const glossaryOutput = document.getElementById('glossary-output');
    if (!glossaryDisplay || !glossaryPanel || !glossaryOutput) return;

    const categories = ["Classes", "Weapons", "Spells", "Battlefields", "Mechanics"];
    const selectedCategory = categories[index];

    glossaryDisplay.textContent = selectedCategory;
    glossaryDisplay.setAttribute('data-value', selectedCategory);
    glossaryPanel.style.display = 'none';

    displayGlossaryDetails(selectedCategory);
}


function displayGlossaryDetails(category) {
    const glossaryOutput = document.getElementById('glossary-output');
    if (!glossaryOutput) return;

    let content = '';

    switch (category) {
        case "Classes":
            content = '<h4>Classes</h4>';
            BattleConfig.classes.forEach(className => {
                const ability = BattleConfig.specialAbilities.find(a => a.class === className);
                const hpModifier = getClassHpModifier(className);
                content += `
                    <p><strong>${className}</strong>: HP Modifier: ${hpModifier}x${ability ? `, Special Ability: ${ability.name} (${(ability.chance * 100).toFixed(1)}% chance: ${ability.description})` : ''}</p>
                `;
            });
            content += `
                <p class="formula">Formula: HP = Base HP (50) × HP Modifier</p>
                <p class="formula">Formula: Damage = (Total Power / Total Troops) × Modifiers (e.g., weapon bonuses, abilities)</p>
            `;
            break;

        case "Weapons":
            content = '<h4>Weapons</h4>';
            content += '<p><strong>Standard Weapons:</strong></p>';
            BattleConfig.weapons.forEach(weapon => {
                content += `
                    <p><strong>${weapon.name}</strong> (Classes: ${weapon.classes.join(', ')}): ${weapon.description}<br>
                    Damage Bonus: ${weapon.damageBonus} (Adds ${weapon.damageBonus * 0.005} to damage per troop)</p>
                `;
            });
            content += '<p><strong>Legendary Weapons (20% chance if troops ≥ 20):</strong></p>';
            BattleConfig.legendaryWeapons.forEach(weapon => {
                content += `
                    <p><strong>${weapon.name}</strong> (Classes: ${weapon.classes.join(', ')}): ${weapon.description}<br>
                    Damage Bonus: ${weapon.damageBonus} (Adds ${weapon.damageBonus * 0.03} to damage per troop)</p>
                `;
            });
            content += '<p><strong>Epic Weapons (30% chance if troops ≥ 20):</strong></p>';
            BattleConfig.epicWeapons.forEach(weapon => {
                content += `
                    <p><strong>${weapon.name}</strong> (Classes: ${weapon.classes.join(', ')}): ${weapon.description}<br>
                    Damage Bonus: ${weapon.damageBonus} (Adds ${weapon.damageBonus * 0.02} to damage per troop)</p>
                `;
            });
            content += `
                <p class="formula">Formula: Weapon Bonus = Damage Bonus × Multiplier (Standard: 0.005, Epic: 0.02, Legendary: 0.03)</p>
            `;
            break;

        case "Spells":
            content = '<h4>Spells</h4>';
            content += '<p><strong>Standard Spells:</strong></p>';
            BattleConfig.spells.forEach(spell => {
                content += `
                    <p><strong>${spell.name}</strong> (Classes: ${spell.classes.join(', ')}): ${spell.description}<br>
                    Damage: ${spell.damage}${spell.effect ? `, Effect: ${spell.effect}` : ''}</p>
                `;
            });
            content += '<p><strong>Ancient Spells (20% chance if troops ≥ 20):</strong></p>';
            BattleConfig.ancientSpells.forEach(spell => {
                content += `
                    <p><strong>${spell.name}</strong> (Classes: ${spell.classes.join(', ')}): ${spell.description}<br>
                    Damage: ${spell.damage}${spell.effect ? `, Effect: ${spell.effect}` : ''}</p>
                `;
            });
            content += '<p><strong>Forsaken Rune Spells (20% chance if troops ≥ 20):</strong></p>';
            BattleConfig.forsakenRuneSpells.forEach(spell => {
                content += `
                    <p><strong>${spell.name}</strong> (Classes: ${spell.classes.join(', ')}): ${spell.description}<br>
                    Damage: ${spell.damage}${spell.effect ? `, Effect: ${spell.effect}` : ''}</p>
                `;
            });
            content += `
                <p class="formula">Formula: Spell Damage = (Dice Roll × Multiplier) × Troop Scaling (Standard: 400, Ancient/Forsaken: 4000; Troop scaling applies for "dX * units")</p>
                <p class="formula">Effect Chance: Burning/Wounded (20%), Stunned (5%)</p>
            `;
            break;

        case "Battlefields":
            content = '<h4>Battlefields</h4>';
            BattleConfig.battlefields.forEach(bf => {
                content += `
                    <p><strong>${bf.name}</strong>: ${bf.description}<br>
                    Effects: ${bf.effect.join(' | ')}<br>
                    Terrain Effects: ${bf.terrainEffect.join(' | ')}<br>
                    Damage Range: ${bf.damageRange[0]}-${bf.damageRange[1]}, Risk: ${bf.risk}%</p>
                `;
            });
            content += `
                <p class="formula">Formula: Environmental Damage = Troop Count × (5% to 15%)</p>
                <p class="formula">Effect Trigger Chance: max(60%, Battlefield Risk); Secondary Effect: 20%</p>
            `;
            break;

        case "Mechanics":
            content = '<h4>Mechanics</h4>';
            content += `
                <p><strong>Troop Calculation:</strong> Troops = XRP Value (Asset Balance × Pool Price in XRP)</p>
                <p><strong>Power Calculation:</strong> Power = Troops × 10</p>
                <p><strong>HP Calculation:</strong> HP per Troop = 50 × Class HP Modifier</p>
                <p><strong>Damage Calculation:</strong> Base Damage per Troop = Total Power / Total Troops</p>
                <p><strong>Attack Mechanics:</strong> Hits = Troops Alive × Hit Chance (Base: 75%, +10% for Archers, -15% in poison terrain)</p>
                <p><strong>Conditions:</strong></p>
                <p>- Bleeding: 1d6 × 100 damage per turn (2 turns)</p>
                <p>- Burning: 1d8 × 100 damage per turn (2 turns)</p>
                <p>- Wounded: Damage reduced by 20% (2 turns)</p>
                <p>- Stunned: Cannot act (1 turn)</p>
                <p class="formula">Formula: Troops Killed = Damage Dealt / HP per Troop</p>
            `;
            break;

        default:
            content = '<p>Select a category to view detailed descriptions.</p>';
            break;
    }

    glossaryOutput.innerHTML = content;
    glossaryOutput.scrollTop = 0;
}

let battleResultData = {
    userAssets: [],
    userPower: 0,
    opponentAssets: [],
    opponentPower: 0,
    outcome: '',
    opponentAddress: '',
    battleCompleted: false,
    userTroopsKilled: 0,
    opponentTroopsKilled: 0
};

function enableBattleResultTransaction() {
    const sendButton = document.getElementById('send-battle-result-btn');
    if (sendButton && battleResultData.battleCompleted) {
        sendButton.disabled = false;
    }
}


function resetBattleResultTransaction() {
    const sendButton = document.getElementById('send-battle-result-btn');
    if (sendButton) {
        sendButton.disabled = true;
    }
    battleResultData = {
        userAssets: [],
        userPower: 0,
        opponentAssets: [],
        opponentPower: 0,
        outcome: '',
        opponentAddress: '',
        battleCompleted: false,
        userTroopsKilled: 0,
        opponentTroopsKilled: 0
    };
}

async function sendBattleResultTransaction() {
    const errorElement = document.getElementById('address-error-battle');
    if (!battleResultData.battleCompleted) {
        errorElement.textContent = 'No battle result available. Complete a battle first.';
        return;
    }

    const { userAssets, userPower, opponentAssets, opponentPower, outcome, opponentAddress, userTroopsKilled, opponentTroopsKilled } = battleResultData;

    if (!globalAddress || !xrpl.isValidAddress(globalAddress)) {
        errorElement.textContent = 'No wallet loaded in Mad Lab.';
        return;
    }

    if (!opponentAddress || !xrpl.isValidAddress(opponentAddress)) {
        errorElement.textContent = 'Invalid opponent address.';
        return;
    }

    
    const userAssetsList = userAssets.join(',');
    const opponentAssetsList = opponentAssets.join(',');
    const memo = `Your wallet battled ${globalAddress} in the Mad Lab Battle Simulator on ${selectedBattlefield.name}. They used ${userAssetsList} with power ${userPower.toLocaleString()} vs your assets ${opponentAssetsList} with power ${opponentPower.toLocaleString()}. They killed ${userTroopsKilled.toLocaleString()} of your troops; you killed ${opponentTroopsKilled.toLocaleString()} of theirs. Outcome: ${outcome} for your forces.`;

    try {
        await ensureConnectedWithRetry();

        const amount = 0.00001;
        const { availableBalanceXrp } = await calculateAvailableBalance(globalAddress);
        const transactionFeeXrp = parseFloat(xrpl.dropsToXrp(TRANSACTION_FEE_DROPS));
        const totalRequiredXrp = amount + transactionFeeXrp;

        if (totalRequiredXrp > availableBalanceXrp) {
            errorElement.textContent = `Insufficient XRP for transaction. Need ${formatBalance(totalRequiredXrp)} XRP, have ${formatBalance(availableBalanceXrp)}.`;
            return;
        }

        const seed = await fetchRenderContent();
        const wallet = xrpl.Wallet.fromSeed(seed);
        if (wallet.classicAddress !== globalAddress) {
            errorElement.textContent = 'Seed does not match loaded wallet address.';
            return;
        }

        const tx = {
            TransactionType: "Payment",
            Account: globalAddress,
            Destination: opponentAddress,
            Amount: xrpl.xrpToDrops(amount),
            Fee: TRANSACTION_FEE_DROPS,
            Memos: [
                {
                    Memo: {
                        MemoData: stringToHex(memo),
                        MemoType: stringToHex("Memo")
                    }
                }
            ]
        };

        const txEntry = {
            tx: tx,
            wallet: wallet,
            description: `Send battle result to ${opponentAddress} (0.00001 XRP)`,
            delayMs: 0,
            type: "payment",
            queueElementId: "transaction-queue-transactions"
        };

        transactionQueue.push(txEntry);
        updateTransactionQueueDisplay();
        if (!isProcessingQueue) {
            processTransactionQueue();
        }

        errorElement.textContent = '';
        log(`Battle result transaction queued for ${opponentAddress}.`);
    } catch (error) {
        errorElement.textContent = `Error queuing transaction: ${error.message}`;
        log(`Error queuing battle result transaction: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const battleSection = document.getElementById('wallet-battle');
    if (!battleSection) return;
    
    
    populateBattlefields();
    populateGlossaryCategories(); 

    const sectionHeader = battleSection.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!battleSection.classList.contains('minimized')) {
                debouncedUpdateUserAssets();
            }
        });
    }
    const battleNavLink = document.querySelector('a[href="#wallet-battle"]');
    if (battleNavLink) {
        battleNavLink.addEventListener('click', () => {
            debouncedUpdateUserAssets();
        });
    }
    const battlefieldPanel = document.getElementById('battlefield-panel');
    if (battlefieldPanel) {
        battlefieldPanel.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    const glossaryPanel = document.getElementById('glossary-panel');
    if (glossaryPanel) {
        glossaryPanel.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    const checkOpponentButton = battleSection.querySelector('button[onclick="checkOpponentBalance()"]');
    if (checkOpponentButton) {
        checkOpponentButton.onclick = debouncedCheckOpponentBalance;
    }
    const refreshBalanceButton = battleSection.querySelector('button[onclick="updateUserAssets()"]');
    if (refreshBalanceButton) {
        refreshBalanceButton.onclick = debouncedUpdateUserAssets;
    }
    const startBattleButton = document.getElementById('battle-start-btn');
    if (startBattleButton) {
        startBattleButton.onclick = startBattleSimulation;
    }
});

window.toggleBattlefieldDropdown = toggleBattlefieldDropdown;
window.checkOpponentBalance = debouncedCheckOpponentBalance;
window.updateUserAssets = debouncedUpdateUserAssets;
window.startBattleSimulation = startBattleSimulation;
window.selectBattlefield = selectBattlefield;
window.toggleAssetSelection = toggleAssetSelection;
window.toggleGlossaryDropdown = toggleGlossaryDropdown;
window.selectGlossaryCategory = selectGlossaryCategory;
window.sendBattleResultTransaction = sendBattleResultTransaction;