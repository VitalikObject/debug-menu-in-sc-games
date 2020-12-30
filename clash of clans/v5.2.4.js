var base = Module.findBaseAddress("libg.so");
var mallocPtr = Module.findExportByName("libc.so", "malloc");
var DebugMenuCtorPtr = 0x00F65E4 + 1;
var LevelMenuCtorPtr = 0x00F97AC + 1;
var EffectPreviewCtorPtr = 0x00F93E0 + 1;
var ResourceListenerAddFilePtr = 0x01DEAB4 + 1;
var StageAddChildPtr = 0x01E7B54 + 1;
var DebugMenuBaseUpdatePtr = 0x00F7524 + 1;
var StageRemoveChildPtr = 0x01E7B68 + 1;
var StageCtorPtr = 0x01E6188 + 1;
var GameModeAddResourcesToLoadPtr = 0x014C644 + 1;
var MoneyHudCtorPtr = 0x011B908 + 1;
var HudUpdatePtr = 0x0118198 + 1;
var LoadLevelButtonButtonPressedPtr = 0x00F9E08 + 1;
var EffectPreviewButtonButtonPressedPtr = 0x00F974C + 1;
var ToggleDebugMenuButtonButtonPressedPtr = 0x00FA9C8 + 1;

var malloc = new NativeFunction(mallocPtr, 'pointer', ['int']);
var fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
var fLevelMenuCtor = new NativeFunction(base.add(LevelMenuCtorPtr), "void", ["pointer", "int"]);
var fEffectPreviewCtor = new NativeFunction(base.add(EffectPreviewCtorPtr), "void", ["pointer"]);
var fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer"]);
var fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
var fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);
var fStageRemoveChild = new NativeFunction(base.add(StageRemoveChildPtr), "int", ["pointer", "pointer"]);

var dptr = malloc(1000);
var stage_address; 
var debugmenutype;
base.add(0x02F728C).writeU8(1);

var load = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		load.detach();
		fResourceListenerAddFile(args[1], base.add(0x02B29AB));
		console.log("debug.sc loaded");
	}
});
var stage = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stage.detach();
		console.log("In Stage!");
		stage_address = args[0];
	}
});
var gameWasLoaded = Interceptor.attach(base.add(MoneyHudCtorPtr), {
    onEnter: function(args) {
		gameWasLoaded.detach();
		console.log("debug menu called");
		fDebugMenuCtor(dptr);
		debugmenutype = 0;
		fStageAddChild(stage_address, dptr);
    }
});
var hudUpdate = Interceptor.attach(base.add(HudUpdatePtr), {
	onEnter: function(args) {
		fDebugMenuBaseUpdate(dptr, 20);
	}
});
var levelButton = Interceptor.attach(base.add(LoadLevelButtonButtonPressedPtr), {
	onEnter: function(args) {
		if (debugmenutype === 0) {
			console.log("Level Button pressed");
			fStageRemoveChild(stage_address, dptr);
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
			fEffectPreviewCtor(dptr);
			fStageAddChild(stage_address, dptr);
			debugmenutype = 2;
		}
	}
});	
var ExitDebug = Interceptor.attach(base.add(ToggleDebugMenuButtonButtonPressedPtr), {
	onEnter: function(args) {
		console.log("Exit Button pressed");
		switch(debugmenutype) {
			case 0:
				fStageRemoveChild(stage_address, dptr);
			break;
			case 1:
				fStageRemoveChild(stage_address, dptr);
				fDebugMenuCtor(dptr)
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
			case 2:
				fStageRemoveChild(stage_address, dptr);
				fDebugMenuCtor(dptr);
				fStageAddChild(stage_address, dptr);
				debugmenutype = 0;
			break;
		}
	}
});