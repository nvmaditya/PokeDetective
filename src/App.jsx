"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuessInput from "./components/UI/GuessInput";
import {
    GuessButton,
    HintButton,
    ResetButton,
    GiveUpButton,
} from "./components/UI/Buttons";
import HintsList from "./components/Hints/HintsList";
import GuessTable from "./components/Guesses/GuessTable";
import UniversalModal from "./components/Modals/UniversalModal";
import ThemeToggle from "./components/UI/ThemeToggle";
import LoadingIndicator from "./components/UI/LoadingIndicator";
import usePokeGame from "./hooks/usePokeGame";
import useDarkMode from "./hooks/useDarkMode";
import { toRgbColor } from "./utils/colorUtils";
import "./animations.css";
import { Helmet } from "react-helmet-async";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
};

// Loading animation variants
const loadingVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.5 },
    },
    exit: {
        scale: 1.2,
        opacity: 0,
        transition: { duration: 0.3 },
    },
};

const LoadingScreen = ({ theme }) => {
    const [loadingText, setLoadingText] = useState("Loading");

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingText((prev) => {
                if (prev === "Loading....") return "Loading";
                return prev + ".";
            });
        }, 400);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.main
            className="min-h-screen flex flex-col items-center justify-center"
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {" "}
            <motion.div
                animate={{
                    rotate: 360,
                    y: [0, -10, 0],
                }}
                transition={{
                    rotate: { duration: 1.5, ease: "linear", repeat: Infinity },
                    y: { duration: 0.8, ease: "easeInOut", repeat: Infinity },
                }}
                className="w-20 h-20 mb-6 flex items-center justify-center"
            >
                <img
                    src="/pokebola.png"
                    alt="Pokéball Loading"
                    className="w-full h-full"
                />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-red-500">Poké</span>
                <span
                    className={
                        theme === "dark" ? "text-white" : "text-gray-800"
                    }
                >
                    Detective
                </span>
            </h1>
            <motion.p
                className={`text-lg ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {loadingText}
            </motion.p>
        </motion.main>
    );
};

const App = () => {
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useDarkMode();
    const [rotate, setRotate] = useState(0);
    const {
        targetPokemon,
        guess,
        guesses,
        win,
        filteredPokemon,
        hints,
        hintsLeft,
        showGiveUpModal,
        hasGivenUp,
        showNewBattleButton,
        isLoading,
        isGuessing,
        handleGuess,
        handleReset,
        handleHint,
        handleInputChange,
        handleSelect,
        handleGiveUp,
        closeModal,
    } = usePokeGame();

    // Generate dynamic page title based on game state
    const getPageTitle = () => {
        if (win) return "You Won! | PokeDetective";
        if (hasGivenUp) return "Try Again | PokeDetective";
        return "PokeDetective | Pokemon Guessing Game";
    };

    // Generate dynamic meta description based on game state
    const getMetaDescription = () => {
        if (win)
            return "You successfully identified the hidden Pokemon! Play again to test your Pokemon knowledge.";
        if (hasGivenUp)
            return "Don't give up! Try to identify another hidden Pokemon and test your knowledge.";
        return "PokeDetective - A Pokemon guessing game where you identify hidden Pokemon through their attributes";
    };

    // Simulate loading time
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500); // 2.5 seconds loading screen

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Helmet>
                <title>{getPageTitle()}</title>
                <meta name="description" content={getMetaDescription()} />
                {targetPokemon && win && (
                    <>
                        <meta
                            name="og:title"
                            content={`I caught ${targetPokemon.name}! | PokéDetective`}
                        />
                        <meta
                            name="og:description"
                            content={`I successfully identified ${targetPokemon.name} in PokéDetective! Can you guess the hidden Pokémon?`}
                        />
                    </>
                )}
            </Helmet>
            <div
                className={`min-h-screen px-3 py-5 sm:px-4 sm:py-8 flex flex-col ${
                    theme === "dark"
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-800"
                } transition-colors duration-200`}
            >
                <AnimatePresence mode="wait">
                    {loading ? (
                        <LoadingScreen key="loading" theme={theme} />
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col flex-grow"
                        >
                            <ThemeToggle
                                theme={theme}
                                toggleTheme={toggleTheme}
                            />
                            <motion.main
                                className="max-w-3xl mx-auto flex-grow w-full"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                style={{
                                    backgroundImage:
                                        theme === "dark"
                                            ? "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%23FF5A5F' strokeWidth='1' fill='none' strokeOpacity='0.05'/%3E%3C/svg%3E')"
                                            : "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%23FF5A5F' strokeWidth='1' fill='none' strokeOpacity='0.1'/%3E%3C/svg%3E')",
                                    backgroundSize: "150px 150px",
                                }}
                            >
                                <motion.header
                                    className="flex flex-col items-center mb-6 sm:mb-8"
                                    variants={itemVariants}
                                >
                                    {" "}
                                    <motion.div
                                        className="w-12 h-12 mb-2 flex items-center justify-center"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            duration: 0.8,
                                            delay: 0.5,
                                        }}
                                        onHoverStart={() => {
                                            setRotate((prev) => prev + 360);
                                        }}
                                    >
                                        {" "}
                                        <motion.img
                                            src="/pokebola.png"
                                            alt="Pokéball"
                                            animate={{ rotate }}
                                            transition={{ duration: 0.6 }}
                                            className="w-full h-full"
                                        />
                                    </motion.div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-1 sm:mb-2">
                                        <span className="text-red-500">
                                            Poké
                                        </span>
                                        <span
                                            className={
                                                theme === "dark"
                                                    ? "text-white"
                                                    : "text-gray-800"
                                            }
                                        >
                                            Detective
                                        </span>
                                    </h1>
                                    <p
                                        className={`text-sm sm:text-base text-center max-w-lg px-2 ${
                                            theme === "dark"
                                                ? "text-gray-300"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        Guess the hidden Pokémon!
                                    </p>
                                </motion.header>
                                <motion.section
                                    className="flex flex-col items-center space-y-4 sm:space-y-5 max-w-md mx-auto px-2 sm:px-0"
                                    variants={itemVariants}
                                    aria-label="Game controls"
                                >
                                    {isLoading ? (
                                        <LoadingIndicator
                                            theme={theme}
                                            message="Catching Pokémon..."
                                        />
                                    ) : (
                                        <>
                                            {" "}
                                            <GuessInput
                                                guess={guess}
                                                onChange={handleInputChange}
                                                onSelect={handleSelect}
                                                filteredPokemon={
                                                    filteredPokemon
                                                }
                                                disabled={
                                                    hasGivenUp ||
                                                    win ||
                                                    isGuessing
                                                }
                                                theme={theme}
                                            />
                                            <div className="w-full grid grid-cols-2 gap-2 sm:gap-4">
                                                <motion.div
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {" "}
                                                    <GuessButton
                                                        onClick={handleGuess}
                                                        disabled={
                                                            hasGivenUp ||
                                                            win ||
                                                            isGuessing
                                                        }
                                                    />
                                                </motion.div>
                                                <motion.div
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <HintButton
                                                        onClick={handleHint}
                                                        hintsLeft={hintsLeft}
                                                    />
                                                </motion.div>
                                            </div>
                                        </>
                                    )}

                                    <AnimatePresence>
                                        {hints.length > 0 && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-full"
                                            >
                                                <HintsList
                                                    hints={hints}
                                                    theme={theme}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {targetPokemon &&
                                        !win &&
                                        guesses.length > 0 &&
                                        !showNewBattleButton && (
                                            <motion.div
                                                className="w-full flex justify-center mt-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <motion.div
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-[40%]"
                                                >
                                                    <GiveUpButton
                                                        onClick={handleGiveUp}
                                                        theme={theme}
                                                    />
                                                </motion.div>
                                            </motion.div>
                                        )}

                                    {showNewBattleButton && !win && (
                                        <motion.div
                                            className="w-full"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 25,
                                            }}
                                        >
                                            <div className="text-center mb-4">
                                                <p
                                                    className={`text-base ${
                                                        theme === "dark"
                                                            ? "text-gray-300"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    Ready to catch another
                                                    Pokémon?
                                                </p>
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex justify-center"
                                            >
                                                <ResetButton
                                                    onClick={handleReset}
                                                />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </motion.section>
                                <AnimatePresence mode="popLayout">
                                    {guesses.length > 0 && (
                                        <motion.section
                                            aria-label="Previous guesses"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <GuessTable
                                                guesses={[...guesses].reverse()}
                                                targetPokemon={targetPokemon}
                                                theme={theme}
                                            />
                                        </motion.section>
                                    )}
                                </AnimatePresence>{" "}
                                <AnimatePresence>
                                    {win && (
                                        <UniversalModal
                                            targetPokemon={targetPokemon}
                                            onNewGame={handleReset}
                                            onClose={closeModal}
                                            theme={theme}
                                            titleText="You caught the Pokémon!"
                                            accentColor="green"
                                            buttonColor="green"
                                            guessCount={guesses.length}
                                        />
                                    )}
                                </AnimatePresence>
                                <AnimatePresence>
                                    {showGiveUpModal && targetPokemon && (
                                        <UniversalModal
                                            targetPokemon={targetPokemon}
                                            onClose={closeModal}
                                            onNewGame={() => {
                                                closeModal();
                                                handleReset();
                                            }}
                                            theme={theme}
                                            titleText="The Pokémon was..."
                                            accentColor="red"
                                            buttonColor="red"
                                            guessCount={guesses.length}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.main>

                            {/* How to play instructions */}
                            <motion.section
                                aria-label="How to play"
                                className="mt-6 text-center max-w-md mx-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2
                                    className={`font-semibold ${
                                        theme === "dark"
                                            ? "text-gray-200"
                                            : "text-gray-700"
                                    } mb-1`}
                                >
                                    How to Play
                                </h2>
                                <p
                                    className={`text-sm ${
                                        theme === "dark"
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Type a Pokemon name and make a guess. Green
                                    cells show correct attributes, red cells
                                    show incorrect ones. Use hints if you're
                                    stuck. Good luck catching them all!
                                </p>
                            </motion.section>

                            <motion.footer
                                className="mt-6 py-4 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <a
                                    href="https://github.com/nvmaditya/PokeDetective"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 ${
                                        theme === "dark"
                                            ? "text-gray-400 hover:text-gray-200"
                                            : "text-gray-600 hover:text-gray-900"
                                    } transition-colors`}
                                    aria-label="GitHub repository"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span className="text-sm">GitHub</span>
                                </a>
                            </motion.footer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default App;
