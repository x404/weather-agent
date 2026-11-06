import { runAgent } from "../../agents/weather-agent";

async function main() {
    const answer = await runAgent(
        "According to the local training weather report, what is the weather in Kyiv according to the student summary?",
        { verbose: true },
    );

    // const answer2 = await runAgent(
    //     "what is the weather in Kyiv?",
    //     { verbose: true },
    // );

    console.log("Answer:", answer.answer);
    // console.log("Answer2:", answer2);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
