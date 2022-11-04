import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {pipe, pipeWith} from "../utils/pipe";

const bet: number = 2_000_000_000;
const deposit: number = 1_000_000_000;

enum Choice {
    Rock = 1,
    Paper = 2,
    Scissors = 3
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const clampRandomInt = (min: number, max: number) =>
    min + Math.floor((max-min+1) * Math.random());

const randomElement = <T>(arr: T[]) => {
    const index = clampRandomInt(0, arr.length - 1);
    return arr[index];
}

const generateRandomLine = (len: number) => {
    const elems = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

    let res = '';
    for (let i = 0; i < len; i++)
        res += randomElement<string>(elems);

    return res;
}

const generateBlindingFactor = pipe(
    () => generateRandomLine(40),
    line => (new TextEncoder()).encode(line),
    ethers.utils.keccak256
)

const encodeData = (address: string, choice: Choice, blindingFactor: string) => {
    return ethers.utils.solidityPack(
        ["address" , "uint8", "bytes32"],
        [address, choice, blindingFactor]
    );
}

describe("RockPaperScissors", function () {
    async function deployRockPaperScissorsFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const RPC = await ethers.getContractFactory("RockPaperScissors");
        const rpc = await RPC.deploy(bet, deposit, 1000);

        return { owner, otherAccount, rpc };
    }

    describe("Deployment", function () {
        it("Should set the right deposit and bet", async function () {
            const {rpc} = await loadFixture(deployRockPaperScissorsFixture);

            expect(await rpc.deposit()).to.equal(deposit);
            expect(await rpc.bet()).to.equal(bet);
        });

        it("Should set the right owner", async function () {
            const {rpc, owner} = await loadFixture(deployRockPaperScissorsFixture);

            expect(await rpc.owner()).to.equal(owner.address);
        });
    });

    describe("Game", function () {
        it("my test", async function() {
            const {rpc, owner, otherAccount} = await loadFixture(deployRockPaperScissorsFixture);

            const choice = Choice.Paper;
            const blindingFactor = generateBlindingFactor();

            const commitment = ethers.utils.keccak256(
                encodeData(owner.address, choice, blindingFactor)
            );

            console.log(`choice = ${choice}`)
            console.log(`Blinding factor = ${blindingFactor}`)
            console.log(`commitment = ${commitment}`)

            // console.log(createKeccakHash('keccak256').digest().toString('hex'));
            // console.log(createKeccakHash('keccak256').digest().toString('hex'));
            // console.log(createKeccakHash('keccak256').digest().toString('hex'));
            // const hash = keccak([owner.address, blindingFactor, choice]);
            // console.log(`kessak([arr]) = ${hash}`)
            // const expected = ethers.utils.defaultAbiCoder.encode(["string" , "uint", "string"], [owner.address, choice, blindingFactor]);
            // const expected = keccak256(owner.address + choice + blindingFactor);

            const foundEncode = await rpc.getEncodeData(choice, blindingFactor);
            const expectedEncode = encodeData(owner.address, choice, blindingFactor);

            console.log("expectedEncode = ", expectedEncode)
            console.log("foundEncode = ", foundEncode)

            const found = await rpc.getKeccak256(choice, blindingFactor);

            // expect(commitment).to.equal(found);
            console.log("Expected = ", commitment)
            console.log("Found = ", found)

            const sender = await rpc.getMessageSender();

            console.log("rpc.address = ", rpc.address)
            console.log("sender = ", sender)
            console.log("owner = ", owner.address)
            console.log("otherAccount = ", otherAccount.address)


            // const result = await rpc.getKeccak256(choice, blindingFactor);
            console.log("ok")
            // const result2 = await rpc.getKeccak256(choice, "0x" + blindingFactor);
            console.log("ok2")

            // console.log(`Result = ${result}`)
        })
    })

});
