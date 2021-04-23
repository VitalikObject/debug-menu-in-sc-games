const base = Module.findBaseAddress("libg.so");

const newPtr = 0x242464;
const DebugMenuCtorPtr = 0xF6594 + 1;
const LevelMenuCtorPtr = 0xF975C + 1;
const EffectPreviewCtorPtr = 0xF9390 + 1;
const DebugInfoCtorPtr = 0xF4808 + 1;
const DebugMenuDtorPtr = 0xF6B00 + 1;
const LevelMenuDtorPtr = 0xF9BDC + 1;
const EffectPreviewDtorPtr = 0xF95C4 + 1;
const DebugInfoDtorPtr = 0xF6388 + 1;
const LoadLevelButtonButtonPressedPtr = 0xF9DB8 + 1;
const EffectPreviewButtonButtonPressedPtr = 0xF96FC + 1;
const ToggleDebugMenuButtonButtonPressedPtr = 0xFA978 + 1;
const ResourceListenerAddFilePtr = 0x1DE58C + 1;
const StageAddChildPtr = 0x1E762C + 1;
const StageRemoveChildPtr = 0x1E7640 + 1;
const GameModeAddResourcesToLoadPtr = 0x14C534 + 1;
const MoneyHudCtorPtr = 0x11B8B8 + 1;
const StageCtorPtr = 0x1E5C60 + 1;
const HudUpdatePtr = 0x118148 + 1;
const DebugMenuBaseUpdatePtr = 0xF74D4 + 1;
const EffectPreviewUpdatePtr = 0xF9564 + 1;
const GlobalChatLineMessageSetMessagePtr = 0x1AC6E8 + 1;
const LogicDefinesOfflineModePtr = 0x2F727C;

const fNew = new NativeFunction(base.add(newPtr), 'pointer', ['int']);
const fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
const fLevelMenuCtor = new NativeFunction(base.add(LevelMenuCtorPtr), "void", ["pointer", "int"]);
const fEffectPreviewCtor = new NativeFunction(base.add(EffectPreviewCtorPtr), "void", ["pointer"]);
const fDebugInfoCtor = new NativeFunction(base.add(DebugInfoCtorPtr), "void", ["pointer"]);
const fDebugMenuDtor = new NativeFunction(base.add(DebugMenuDtorPtr), "void", ["pointer"]);
const fLevelMenuDtor = new NativeFunction(base.add(LevelMenuDtorPtr), "void", ["pointer"]);
const fEffectPreviewDtor = new NativeFunction(base.add(EffectPreviewDtorPtr), "void", ["pointer"]);
const fDebugInfoDtor = new NativeFunction(base.add(DebugInfoDtorPtr), "void", ["pointer"]);
const fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer"]);
const fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
const fStageRemoveChild = new NativeFunction(base.add(StageRemoveChildPtr), "int", ["pointer", "pointer"]);
const fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);
const fEffectPreviewUpdate = new NativeFunction(base.add(EffectPreviewUpdatePtr), "int", ["pointer", "float"]);

base.add(LogicDefinesOfflineModePtr).writeU8(1);

Memory.protect(base.add(0x16766E), 1, 'rwx');
Memory.writeByteArray(base.add(0x16766E), [0x7B]);

var dPtr;
var stagePtr;
var debugMenuType = 0;

const loadTexture = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		fResourceListenerAddFile(args[1], base.add(0x2B247B));
		loadTexture.detach();
	}
});

const getStage = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stagePtr = args[0];
		getStage.detach();
	}
});

const moneyHud = Interceptor.attach(base.add(MoneyHudCtorPtr), {
	onEnter: function(args) {
		dPtr = fNew(228);
		fDebugMenuCtor(dPtr);
		fStageAddChild(stagePtr, dPtr);
		moneyHud.detach();
	}
});

Interceptor.attach(base.add(HudUpdatePtr), {
	onEnter: function(args) {
		if(debugMenuType >= 0 && debugMenuType != 2) {
			fDebugMenuBaseUpdate(dPtr, 0);
		}
		else if (debugMenuType === 2) {
			fEffectPreviewUpdate(dPtr, 0);
		}
	}
});

Interceptor.attach(base.add(LoadLevelButtonButtonPressedPtr), {
	onEnter: function(args) {
		if (debugMenuType === 0) {
			fStageRemoveChild(stagePtr, dPtr);
			fDebugMenuDtor(dPtr);
			dPtr = fNew(228);
			fLevelMenuCtor(dPtr, 0);
			fStageAddChild(stagePtr, dPtr);
			debugMenuType = 1;
		}
	}
});

Interceptor.attach(base.add(EffectPreviewButtonButtonPressedPtr), {
	onEnter: function(args) {
		if(debugMenuType === 0) {
			fStageRemoveChild(stagePtr, dPtr);
			fDebugMenuDtor(dPtr);
			dPtr = fNew(228);
			fEffectPreviewCtor(dPtr);
			fStageAddChild(stagePtr, dPtr);
			debugMenuType = 2;
		}
	}
});	

Interceptor.attach(base.add(ToggleDebugMenuButtonButtonPressedPtr), {
	onEnter: function(args) {
		switch(debugMenuType) {
			case 0:
				fStageRemoveChild(stagePtr, dPtr);
				fDebugMenuDtor(dPtr);
				debugMenuType = -1;
				break;
			case 1:
				fStageRemoveChild(stagePtr, dPtr);
				fLevelMenuDtor(dPtr);
				dPtr = fNew(500);
				fDebugMenuCtor(dPtr)
				fStageAddChild(stagePtr, dPtr);
				debugMenuType = 0;
				break;
			case 2:
				fStageRemoveChild(stagePtr, dPtr);
				fEffectPreviewDtor(dPtr);
				dPtr = fNew(500);
				fDebugMenuCtor(dPtr);
				fStageAddChild(stagePtr, dPtr);
				debugMenuType = 0;
				break;
			case 3:
				fStageRemoveChild(stagePtr, dPtr);
				fDebugInfoDtor(dPtr);
				debugMenuType = -1;
				break;
		}
	}
});

Interceptor.attach(base.add(GlobalChatLineMessageSetMessagePtr), {
	onEnter: function(args) {
		let len = args[1].readU32();
		if (len >= 8) {
			let msg = args[1].add(16).readPointer().readUtf8String();
			switch(msg) {
				case "/debug_menu":
					debugMenuType = 0;
					dPtr = fNew(500);
					fDebugMenuCtor(dPtr)
					fStageAddChild(stagePtr, dPtr);
					break;
				case "/info_menu":
					debugMenuType = 3;
					dPtr = fNew(500);
					fDebugInfoCtor(dPtr)
					fStageAddChild(stagePtr, dPtr);		
					break;
			}				
		}	
	}
});