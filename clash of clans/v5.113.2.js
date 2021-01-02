const base = Module.findBaseAddress("libg.so");
const mallocPtr = Module.findExportByName("libc.so", "malloc");
const freePtr = Module.findExportByName("libc.so", "free");
const DebugMenuCtorPtr = 0x004BD40 + 1;
const LevelMenuCtorPtr = 0x004EF50 + 1;
const EffectPreviewCtorPtr = 0x004EB84 + 1; 
const DebugInfoCtor = 0x0049C24 + 1;
const ResourceListenerAddFilePtr = 0x01351B0 + 1;
const StageAddChildPtr = 0x013EEB0 + 1;
const DebugMenuBaseUpdatePtr = 0x004CD84 + 1;
const EffectPreviewUpdatePtr = 0x004ED58 + 1;
const StageRemoveChildPtr = 0x013EEC4 + 1;
const StageCtorPtr = 0x013D310 + 1;
const StringCtorPtr = 0x010D15C + 1;
const GameModeAddResourcesToLoadPtr = 0x00A2BB0 + 1;
const MoneyHudCtorPtr = 0x00705C0 + 1;
const HudUpdatePtr = 0x006E2D4 + 1;
const LoadLevelButtonButtonPressedPtr = 0x004F5AC + 1;
const EffectPreviewButtonButtonPressedPtr = 0x004EEF0 + 1;
const ToggleDebugMenuButtonButtonPressedPtr = 0x005016C + 1;
const ChatInputGlobalSendMessagePtr = 0x0041A94 + 1;

const malloc = new NativeFunction(mallocPtr, 'pointer', ['int']);
const free = new NativeFunction(freePtr, 'void', ['pointer']);
const fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
const fLevelMenuCtor = new NativeFunction(base.add(LevelMenuCtorPtr), "void", ["pointer", "int"]);
const fEffectPreviewCtor = new NativeFunction(base.add(EffectPreviewCtorPtr), "void", ["pointer"]);
const fDebugInfoCtor = new NativeFunction(base.add(DebugInfoCtor), "void", ["pointer"]);
const fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer"]);
const fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
const fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);
const fEffectPreviewUpdate = new NativeFunction(base.add(EffectPreviewUpdatePtr), "int", ["pointer", "float"]);
const fStageRemoveChild = new NativeFunction(base.add(StageRemoveChildPtr), "int", ["pointer", "pointer"]);

var dptr;
var stage_address;
var debugmenutype = -1;
var leave = 0;
base.add(0x03A96D8).writeU8(1);

const load = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		load.detach();
		fResourceListenerAddFile(args[1], base.add(0x030BB9A));
		console.log("debug.sc loaded");
	}
});
const stage = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stage.detach();
		console.log("In Stage!");
		stage_address = args[0];
	}
});
const hudUpdate = Interceptor.attach(base.add(HudUpdatePtr), {
	onEnter: function(args) {
		if(debugmenutype >= 0 && debugmenutype != 2) {
			fDebugMenuBaseUpdate(dptr, 0);
		}
		if(debugmenutype === 2) {
			fEffectPreviewUpdate(dptr, 0);
		}
	}
});
const levelButton = Interceptor.attach(base.add(LoadLevelButtonButtonPressedPtr), {
	onEnter: function(args) {
		if (debugmenutype === 0) {
			console.log("Level Button pressed");
			fStageRemoveChild(stage_address, dptr);
			free(dptr);
			dptr = malloc(228);
			fLevelMenuCtor(dptr, 0);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 1;
		}
	}
});		
var effectButton = Interceptor.attach(base.add(EffectPreviewButtonButtonPressedPtr), {
	onEnter: function(args) {
		if(debugmenutype === 0) {
			console.log("Effect Button pressed");
			fStageRemoveChild(stage_address, dptr);
			free(dptr);
			dptr = malloc(228);
			fEffectPreviewCtor(dptr);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 2;
		}
	}
});
const ExitDebug = Interceptor.attach(base.add(ToggleDebugMenuButtonButtonPressedPtr), {
	onEnter: function(args) {
		console.log("Exit Button pressed");
		switch(debugmenutype) {
			case 0:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				debugmenutype = -1;
			break;
			case 1:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				dptr = malloc(228);
				fDebugMenuCtor(dptr)
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
			case 2:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				dptr = malloc(228);
				fDebugMenuCtor(dptr);
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
			case 3:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				debugmenutype = -1;
			break;
		}
	}
});
const sendMessageCtor = Interceptor.attach(base.add(ChatInputGlobalSendMessagePtr), {
	onEnter: function(args) {
		leave = 0;
		const readChatMessage = Interceptor.attach(base.add(StringCtorPtr), {
			onEnter: function(args) {
				let msg = args[1].readUtf8String();
				switch(msg) {
					case "/debug_menu":
						debugmenutype = 0;
						dptr = malloc(228);
						fDebugMenuCtor(dptr)
						fStageAddChild(stage_address, dptr);
						readChatMessage.detach();	
					break;
					case "/info_menu":
						debugmenutype = 3;
						dptr = malloc(500);
						fDebugInfoCtor(dptr)
						fStageAddChild(stage_address, dptr);
						readChatMessage.detach();		
					break;
				}
				if(leave === 1) {
					readChatMessage.detach();
				}
			}
		});
	},
	onLeave: function(args) {
		leave = 1;
	}
});