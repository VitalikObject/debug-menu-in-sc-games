const base = Module.findBaseAddress("libg.so");
const mallocPtr = Module.findExportByName("libc.so", "malloc");

const LogicDefinesOfflineModePtr = 0x30F858;
const GameModeAddResourcesToLoadPtr = 0xAB7DC + 1;
const ResourceListenerAddFilePtr = 0x11C3F4 + 1;
const StageCtorPtr = 0x12CAA8 + 1;
const MoneyHudCtorPtr = 0x6CA88 + 1;
const DebugMenuCtorPtr = 0x401F4 + 1;
const StageAddChildPtr = 0x12A87A + 1;
const HudUpdatePtr = 0x69BD0 + 1;
const DebugMenuBaseUpdatePtr = 0x4069C + 1;

const malloc = new NativeFunction(mallocPtr, "pointer", ["int"]);
const fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer", "int", "int"]);
const fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
const fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "void", ["pointer", "pointer"]);
const fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "void", ["pointer", "float"]);

base.add(LogicDefinesOfflineModePtr).writeU8(1);

var stagePtr;
var debugMenuPtr; 

const loadTexture = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		fResourceListenerAddFile(args[1], base.add(0x2789FE), -1, -1);
		loadTexture.detach();
	}
});

const getStageAddress = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stagePtr = args[0];
		getStageAddress.detach();
	}
});

const moneyHudCtor = Interceptor.attach(base.add(MoneyHudCtorPtr), {
	onEnter: function(args) {
		debugMenuPtr = malloc(228);
		fDebugMenuCtor(debugMenuPtr);
		fStageAddChild(stagePtr, debugMenuPtr);
		moneyHudCtor.detach();
	}
});

Interceptor.attach(base.add(HudUpdatePtr), {
	onEnter: function(args) {
		fDebugMenuBaseUpdate(debugMenuPtr, 0);
	}
});
