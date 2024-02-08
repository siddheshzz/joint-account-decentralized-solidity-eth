const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("JointBankAccount", function () {
  async function deployJointBankAccount() {
    
    const [addr0,addr1,addr2,addr3,addr4] = await ethers.getSigners();

    const JointBankAccount = await ethers.getContractFactory("JointBankAccount");
    const jointBankAccount = await JointBankAccount.deploy();

    return { jointBankAccount, addr0,addr1,addr2,addr3,addr4 };
  }
  async function deployBankAccountWithAccounts(
    owners = 1,
    deposit = 0,
    withdrawlAmounts = []
  ) {
    const { jointBankAccount, addr0, addr1, addr2, addr3, addr4 } =
      await loadFixture(deployJointBankAccount);
    let addresses = [];

    if (owners == 2) addresses = [addr1.address];
    else if (owners == 3) addresses = [addr1.address, addr2.address];
    else if (owners == 4)
      addresses = [addr1.address, addr2.address, addr3.address];

    await jointBankAccount.connect(addr0).createAccount(addresses);

    if (deposit > 0) {
      await jointBankAccount
        .connect(addr0)
        .deposit(0, { value: deposit.toString() });
    }

    for (const withdrawlAmount of withdrawlAmounts) {
      await jointBankAccount.connect(addr0).requestWithdrawl(0, withdrawlAmount);
    }

    return { jointBankAccount, addr0, addr1, addr2, addr3, addr4 };
  }


  describe("Deployment",()=>{
    it("should deploy without error",async()=>{
      await loadFixture(deployJointBankAccount)
    });
  });

  describe("Creating an Account",()=>{
    it("shpould allow creating a single user account",async ()=> {
      const {jointBankAccount, addr0} = await loadFixture(deployJointBankAccount)
      await jointBankAccount.connect(addr0).createAccount([]);
      const accounts = await jointBankAccount.connect(addr0).getAccounts();
      expect(accounts.length).to.equal(1);

    });

    it("should allow creating a double user account",async ()=> {
      const {jointBankAccount, addr0, addr1,} = await loadFixture(deployJointBankAccount)
      await jointBankAccount.connect(addr0).createAccount([addr1]);
      const accounts1 = await jointBankAccount.connect(addr0).getAccounts();
      expect(accounts1.length).to.equal(1);

      const accounts2 = await jointBankAccount.connect(addr1).getAccounts();
      expect(accounts2.length).to.equal(1);
      




    });

    it("should allow creating a triple user account",async ()=> {
      const {jointBankAccount, addr0, addr1,addr2} = await loadFixture(deployJointBankAccount)
      await jointBankAccount.connect(addr0).createAccount([addr1,addr2]);
      const accounts1 = await jointBankAccount.connect(addr0).getAccounts();
      expect(accounts1.length).to.equal(1);

      const accounts2 = await jointBankAccount.connect(addr1).getAccounts();
      expect(accounts2.length).to.equal(1);
      
      const accounts3 = await jointBankAccount.connect(addr2).getAccounts();
      expect(accounts3.length).to.equal(1);
      



    });

    it("should allow creating a quadruple user account",async ()=> {
      const {jointBankAccount, addr0, addr1,addr2,addr3} = await loadFixture(deployJointBankAccount)
      await jointBankAccount.connect(addr0).createAccount([addr1,addr2,addr3]);
      const accounts1 = await jointBankAccount.connect(addr0).getAccounts();
      expect(accounts1.length).to.equal(1);

      const accounts2 = await jointBankAccount.connect(addr1).getAccounts();
      expect(accounts2.length).to.equal(1);
      
      const accounts3 = await jointBankAccount.connect(addr2).getAccounts();
      expect(accounts3.length).to.equal(1);
      const accounts4 = await jointBankAccount.connect(addr3).getAccounts();
      expect(accounts4.length).to.equal(1);



    });
    it("shpould not allow creating a duplicate user account",async ()=> {
      const {jointBankAccount, addr0} = await loadFixture(deployJointBankAccount)
      await expect(jointBankAccount.connect(addr0).createAccount([addr0])).to.be.reverted;
      

    });
    it("shpould not allow creating a account with 5 owners",async ()=> {
      const {jointBankAccount, addr0,addr1,addr2,addr3,addr4} = await loadFixture(deployJointBankAccount)
      await expect(jointBankAccount.connect(addr0).createAccount([addr0,addr1,addr2,addr3,addr4])).to.be.reverted;
      

    });
    it("shpould not allow creating a account with 5 owners",async ()=> {
      const {jointBankAccount, addr0} = await loadFixture(deployJointBankAccount);

      for(let idx = 0;idx<3;idx++){
        await jointBankAccount.connect(addr0).createAccount([]);
      }
      await expect(jointBankAccount.connect(addr0).createAccount([])).to.be.reverted; 

       });
  }); describe("Despositing", () => {
      it("should allow deposit from account owner", async () => {
        const { jointBankAccount, addr0 } = await deployBankAccountWithAccounts(1);
        await expect(
          jointBankAccount.connect(addr0).deposit(0, { value: "100" })
        ).to.changeEtherBalances([jointBankAccount, addr0], ["100", "-100"]);
      });
  
      it("should NOT allow deposit from non-account owner", async () => {
        const { jointBankAccount, addr1 } = await deployBankAccountWithAccounts(1);
        await expect(jointBankAccount.connect(addr1).deposit(0, { value: "100" })).to
          .be.reverted;
      });
    });
  
    describe("Withdraw", () => {
      describe("Request a withdraw", () => {
        it("account owner can request withdraw", async () => {
          const { jointBankAccount, addr0 } = await deployBankAccountWithAccounts(
            1,
            100
          );
          await jointBankAccount.connect(addr0).requestWithdrawl(0, 100);
        });
  
        it("account owner can not request withdraw with invalid amount", async () => {
          const { jointBankAccount, addr0 } = await deployBankAccountWithAccounts(
            1,
            100
          );
          await expect(jointBankAccount.connect(addr0).requestWithdrawl(0, 101)).to.be
            .reverted;
        });
  
        it("non-account owner cannot request withdraw", async () => {
          const { jointBankAccount, addr1 } = await deployBankAccountWithAccounts(
            1,
            100
          );
          await expect(jointBankAccount.connect(addr1).requestWithdrawl(0, 90)).to.be
            .reverted;
        });
  
        it("non-account owner cannot request withdraw", async () => {
          const { jointBankAccount, addr0 } = await deployBankAccountWithAccounts(
            1,
            100
          );
          await jointBankAccount.connect(addr0).requestWithdrawl(0, 90);
          await jointBankAccount.connect(addr0).requestWithdrawl(0, 10);
        });
      });
  
      describe("Approve a withdraw", () => {
        it("should allow account owner to approve withdraw", async () => {
          const { jointBankAccount, addr1 } = await deployBankAccountWithAccounts(
            2,
            100,
            [100]
          );
          await jointBankAccount.connect(addr1).approveWithdrawl(0, 0);
          expect(await jointBankAccount.getApprovals(0, 0)).to.equal(1);
        });
  
        it("should not allow non-account owner to approve withdraw", async () => {
          const { jointBankAccount, addr2 } = await deployBankAccountWithAccounts(
            2,
            100,
            [100]
          );
          await expect(jointBankAccount.connect(addr2).approveWithdrawl(0, 0)).to.be
            .reverted;
        });
  
        it("should not allow owner to approve withdrawal multiple times", async () => {
          const { jointBankAccount, addr1 } = await deployBankAccountWithAccounts(
            2,
            100,
            [100]
          );
          jointBankAccount.connect(addr1).approveWithdrawl(0, 0);
          await expect(jointBankAccount.connect(addr1).approveWithdrawl(0, 0)).to.be
            .reverted;
        });
  
        it("should not allow creator of request to approve request", async () => {
          const { jointBankAccount, addr0 } = await deployBankAccountWithAccounts(
            2,
            100,
            [100]
          );
          await expect(jointBankAccount.connect(addr0).approveWithdrawl(0, 0)).to.be
            .reverted;
        });
      });
  
      describe("Make withdraw", () => {
        it("should allow creator of request to withdraw approved request", async () => {
          const { jointBankAccount, addr0, addr1 } =
            await deployBankAccountWithAccounts(2, 100, [100]);
          await jointBankAccount.connect(addr1).approveWithdrawl(0, 0);
          await expect(
            jointBankAccount.connect(addr0).withdraw(0, 0)
          ).to.changeEtherBalances([jointBankAccount, addr0], ["-100", "100"]);
        });
  
        it("should not allow creator of request to withdraw approved request twice", async () => {
          const { jointBankAccount, addr0, addr1 } =
            await deployBankAccountWithAccounts(2, 200, [100]);
          await jointBankAccount.connect(addr1).approveWithdrawl(0, 0);
          await expect(
            jointBankAccount.connect(addr0).withdraw(0, 0)
          ).to.changeEtherBalances([jointBankAccount, addr0], ["-100", "100"]);
          await expect(jointBankAccount.connect(addr0).withdraw(0, 0)).to.be.reverted;
        });
  
        it("should not allow non-creator of request to withdraw approved request ", async () => {
          const { jointBankAccount, addr1 } = await deployBankAccountWithAccounts(
            2,
            200,
            [100]
          );
          await jointBankAccount.connect(addr1).approveWithdrawl(0, 0);
          await expect(jointBankAccount.connect(addr1).withdraw(0, 0)).to.be.reverted;
        });
  
        it("should not allow non-creator of request to withdraw approved request ", async () => {
          const { jointBankAccount, addr0 } = await deployBankAccountWithAccounts(
            2,
            200,
            [100]
          );
          await expect(jointBankAccount.connect(addr0).withdraw(0, 0)).to.be.reverted;
        });
      });
    });
  });