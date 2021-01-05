const base = Module.findBaseAddress("libg.so");
const mallocPtr = Module.findExportByName("libc.so", "malloc");
const freePtr = Module.findExportByName("libc.so", "free");
const freadPtr = Module.findExportByName("libc.so", "fread");
const fopenPtr = Module.findExportByName("libc.so", "fopen");
const fclosePtr = Module.findExportByName("libc.so", "fclose");
const ftellPtr = Module.findExportByName("libc.so", "ftell");
const fseekPtr = Module.findExportByName("libc.so", "fseek");
const rewindPtr = Module.findExportByName("libc.so", "rewind");
const DebugMenuCtorPtr = 0x00F65E4 + 1;
const LevelMenuCtorPtr = 0x00F97AC + 1;
const EffectPreviewCtorPtr = 0x00F93E0 + 1;
const DebugInfoCtor = 0x00F4858 + 1;
const ResourceListenerAddFilePtr = 0x01DEAB4 + 1;
const StageAddChildPtr = 0x01E7B54 + 1;
const DebugMenuBaseUpdatePtr = 0x00F7524 + 1;
const EffectPreviewUpdatePtr = 0x00F95B4 + 1;
const StageRemoveChildPtr = 0x01E7B68 + 1;
const StageCtorPtr = 0x01E6188 + 1;
const StringCtorPtr = 0x01B7C74 + 1;
const GameModeAddResourcesToLoadPtr = 0x014C644 + 1;
const MoneyHudCtorPtr = 0x011B908 + 1;
const HudUpdatePtr = 0x0118198 + 1;
const LoadLevelButtonButtonPressedPtr = 0x00F9E08 + 1;
const EffectPreviewButtonButtonPressedPtr = 0x00F974C + 1;
const ToggleDebugMenuButtonButtonPressedPtr = 0x00FA9C8 + 1;
const ChatInputGlobalSendMessagePtr = 0x00ECE60 + 1;
const GameModeSaveOfflineHomePtr = 0x014DD90 + 1;
const GameModeSaveOfflineAvatarPtr = 0x014DE58 + 1;
const LogicClientHomeSetHomeJSONPtr = 0x018C088 + 1;
const GameModeSetTransitionPtr = 0x014DA08 + 1;
const LogicLevelSaveToJSONPtr = 0x018E40C + 1;
const LogicGameModeLoadHomeStatePtr = 0x0190A60 + 1;
const LogicClientHomeGetHomeJSONPtr = 0x018C0A4 + 1;

const malloc = new NativeFunction(mallocPtr, 'pointer', ['int']);
const free = new NativeFunction(freePtr, 'void', ['pointer']);
const fread = new NativeFunction(freadPtr, 'int', ['pointer', 'int', 'int', 'pointer']);
const fopen = new NativeFunction(fopenPtr, 'pointer', ['pointer', 'pointer']);
const fclose = new NativeFunction(fclosePtr, 'int', ['pointer']);
const ftell = new NativeFunction(ftellPtr, 'int', ['pointer']);
const fseek = new NativeFunction(fseekPtr, 'int', ['pointer', 'int', 'int']);
const rewind = new NativeFunction(rewindPtr, 'void', ['pointer']);
const fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
const fLevelMenuCtor = new NativeFunction(base.add(LevelMenuCtorPtr), "void", ["pointer", "int"]);
const fEffectPreviewCtor = new NativeFunction(base.add(EffectPreviewCtorPtr), "void", ["pointer"]);
const fDebugInfoCtor = new NativeFunction(base.add(DebugInfoCtor), "void", ["pointer"]);
const fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer"]);
const fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
const fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);
const fEffectPreviewUpdate = new NativeFunction(base.add(EffectPreviewUpdatePtr), "int", ["pointer", "float"]);
const fStageRemoveChild = new NativeFunction(base.add(StageRemoveChildPtr), "int", ["pointer", "pointer"]);
const fLogicClientHomeSetHomeJSON = new NativeFunction(base.add(LogicClientHomeSetHomeJSONPtr), "void", ["pointer", "pointer"]);
const fStringCtor = new NativeFunction(base.add(StringCtorPtr), "void", ["pointer", "pointer"]);
const fGameModeSetTransition = new NativeFunction(base.add(GameModeSetTransitionPtr), "int", ["int"]);
const fGameModeSaveOfflineHome = new NativeFunction(base.add(GameModeSaveOfflineHomePtr), "int", ["pointer"]);
const fLogicGameModeLoadHomeState = new NativeFunction(base.add(LogicGameModeLoadHomeStatePtr), "int", ["int", "pointer", "pointer", "int"]);
const fLogicLevelSaveToJSON = new NativeFunction(base.add(LogicLevelSaveToJSONPtr), "int", ["pointer", "pointer"]);
const fLogicClientHomeGetHomeJSON = new NativeFunction(base.add(LogicClientHomeGetHomeJSONPtr), "int", ["pointer"]);

const SEEK_SET = 0;
const SEEK_CUR = 1;
const SEEK_END = 2;

var dptr;
var stage_address;
var debugmenutype = -1;
var leave = 0;
var offlineptr;
var save;
var playerhome;
var home;
var lSize;
base.add(0x02F728C).writeU8(1);

const load = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		load.detach();
		fResourceListenerAddFile(args[1], base.add(0x02B29AB));
	}
});
const stage = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stage.detach();
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
			fStageRemoveChild(stage_address, dptr);
			free(dptr);
			dptr = malloc(500);
			fLevelMenuCtor(dptr, 0);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 1;
		}
	}
});		
var effectButton = Interceptor.attach(base.add(EffectPreviewButtonButtonPressedPtr), {
	onEnter: function(args) {
		if(debugmenutype === 0) {
			fStageRemoveChild(stage_address, dptr);
			free(dptr);
			dptr = malloc(500);
			fEffectPreviewCtor(dptr);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 2;
		}
	}
});
const ExitDebug = Interceptor.attach(base.add(ToggleDebugMenuButtonButtonPressedPtr), {
	onEnter: function(args) {
		switch(debugmenutype) {
			case 0:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				debugmenutype = -1;
			break;
			case 1:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				dptr = malloc(500);
				fDebugMenuCtor(dptr)
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
			case 2:
				fStageRemoveChild(stage_address, dptr);
				free(dptr);
				dptr = malloc(500);
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
const getJsonOnLoad = Interceptor.replace(base.add(LogicClientHomeSetHomeJSONPtr), new NativeCallback(function(OfflineHome, stringb) {
	home = stringb;
	
	offlineptr = OfflineHome;
	
	playerhome = stringb.add(16).readPointer().readUtf8String();
	try {
		if(playerhome.startsWith("{\"mrvitalik\"")) { //you must use apk from readMe
			var pFile = fopen(createStringPtrFromJSString("/data/data/com.supercell.clashofclans/offline_home.json"), createStringPtrFromJSString("rb"));
			
			fseek(pFile, 0, SEEK_END);			
			lSize = ftell(pFile);
			rewind(pFile);
	
			var village = malloc(lSize + 1);
			fread(village, lSize, 1, pFile);
			fclose(pFile);
			if(village.readUtf8String().startsWith("{\"and") && village.readUtf8String().endsWith("}")) {
				stringb.writeU32(village.readUtf8String().length + 1);
				stringb.add(4).writeU32(village.readUtf8String().length + 1);
				stringb.add(16).writePointer(createStringPtrFromJSString(village.readUtf8String()));
			}
			free(village);
		}
	}catch(error) {
		stringb = home;
	}
	fLogicClientHomeSetHomeJSON(OfflineHome, stringb);
}, 'void', ['pointer', 'pointer']));
const sendMessageCtor = Interceptor.attach(base.add(ChatInputGlobalSendMessagePtr), {
	onEnter: function(args) {
		leave = 0;
		const readChatMessage = Interceptor.attach(base.add(StringCtorPtr), {
			onEnter: function(args) {
				let msg = args[1].readUtf8String();
				switch(msg) {
					case "/debug_menu":
						debugmenutype = 0;
						dptr = malloc(500);
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
					case "/save":
						fGameModeSaveOfflineHome(Memory.readPointer(base.add(0x02F5950)));
						save = base.add(0x02F5954).readPointer().add(16).readPointer().add(16).readPointer().readUtf8String();
						if(save.startsWith("{\"andr") && save.endsWith("}")) {
							var file_for_save = new File("/data/data/com.supercell.clashofclans/offline_home.json","w");
							file_for_save.write(save);
							file_for_save.flush();
							file_for_save.close();
						}
						readChatMessage.detach()
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

function createStringPtrFromJSString(message) {
    var charPtr = malloc(message.length + 1);
    Memory.writeUtf8String(charPtr, message);
    return charPtr
}
